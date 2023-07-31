class SelectionNFilterExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._button = null;
    this._onTexturesLoaded = (ev) => this.onModelLoaded(ev.model);
  }

  async onModelLoaded(model) {
    this.fragList = await this.viewer.model.getFragmentList();
    this.viewer.clickHandler.handleSingleClick = this.fitToView.bind(this);
  }

  async fitToView(event){
    if(this._button.getState() == Autodesk.Viewing.UI.Button.State.ACTIVE){
      let result = this.viewer.clientToWorld(event.canvasX, event.canvasY, true);
      if(!!result){
        let box = await this.getBoxFromDbid(result.dbId);
        let fits = await viewer.navigation.fitBounds(false, box);
      }
      else{
        this.viewer.impl.clearHighlight();
      }
    }
  }

  async load() {
    this.viewer.addEventListener(Autodesk.Viewing.TEXTURES_LOADED_EVENT, this._onTexturesLoaded);
    return true;
  }

  async getFragsIdsFromdbId(dbId) {
    const fragsIds = this.fragList.fragments.fragId2dbId.map((id, fragId) => id == dbId ? fragId : -1).filter(i => i > -1);
    return fragsIds;
  }

  async getBoxFromFrag(fragId) {
    const boxCoordinates = this.fragList.fragments.boxes.slice(fragId * 6, (fragId * 6) + 6);
    const boxMin = new THREE.Vector3(boxCoordinates[0], boxCoordinates[1], boxCoordinates[2]);
    const boxMax = new THREE.Vector3(boxCoordinates[3], boxCoordinates[4], boxCoordinates[5]);
    const fragBox = new THREE.Box3(boxMin, boxMax);
    return fragBox;
  }

  async getBoxFromDbid(dbId) {
    const fragsIds = await this.getFragsIdsFromdbId(dbId);
    let fragsBoxes = [];
    for (const fragId of fragsIds) {
      // this.viewer.impl.highlightFragment(this.viewer.model, fragId);
      let newBox = await this.getBoxFromFrag(fragId);
      fragsBoxes.push(newBox);
    }
    var box3 = new THREE.Box3();
    fragsBoxes.map(fbox => box3.union(fbox));
    return box3;
  }

  unload() {
    if (this._button) {
      this.removeToolbarButton(this._button);
      this._button = null;
    }
    return true;
  }

  onToolbarCreated() {
    this._button = this.createToolbarButton('selectnfit-button', 'https://img.icons8.com/pastel-glyph/30/arrows-to-center.png', 'Fit To View');
    this._button.onClick = () => {
      if (this._button.getState() == Autodesk.Viewing.UI.Button.State.ACTIVE) {
        this._button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
      } else {
        this._button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);
      }
    };
  }

  createToolbarButton(buttonId, buttonIconUrl, buttonTooltip) {
    let group = this.viewer.toolbar.getControl('noprops-toolbar-group');
    if (!group) {
      group = new Autodesk.Viewing.UI.ControlGroup('noprops-toolbar-group');
      this.viewer.toolbar.addControl(group);
    }
    const button = new Autodesk.Viewing.UI.Button(buttonId);
    button.setToolTip(buttonTooltip);
    group.addControl(button);
    const icon = button.container.querySelector('.adsk-button-icon');
    if (icon) {
      icon.style.backgroundImage = `url(${buttonIconUrl})`;
      icon.style.backgroundSize = `24px`;
      icon.style.backgroundRepeat = `no-repeat`;
      icon.style.backgroundPosition = `center`;
    }
    return button;
  }

  removeToolbarButton(button) {
    const group = this.viewer.toolbar.getControl('noprops-toolbar-group');
    group.removeControl(button);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('SelectionNFilterExtension', SelectionNFilterExtension);