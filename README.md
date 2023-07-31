# aps-viewer-fitnselect-noprops

## Introduction

This sample demonstrates a way to mimic fittoview behavior from Viewer in cases where we don;t have the properties loaded (using 'skipPropertyDb: true' in load options).

In this specific case, we can't use any method that relies on instancetree, since it's not available.
We can use, for instance, selection.

To go through this limitation, we'll have to "recreate" selection tool, find the fragments of the selected element and adjust the view.

![thumbnail](./assets/thumbnail.gif)

## THE APPROACH

First thing we'll do is find the proper dbId based on mouse click.

That can be done using clienttoworld method based on the clicked position on the screen, just like in the snippet below:

```js
let result = this.viewer.clientToWorld(event.canvasX, event.canvasY, true);
```

Once we have the dbId, we need to obtain the fragments

```js
async getFragsIdsFromdbId(dbId) {
  const fragsIds = this.fragList.fragments.fragId2dbId.map((id, fragId) => id == dbId ? fragId : -1).filter(i => i > -1);
  return fragsIds;
}
```

Then, for each fragment, we need the bounding box

```js
async getBoxFromFrag(fragId) {
  const boxCoordinates = this.fragList.fragments.boxes.slice(fragId * 6, (fragId * 6) + 6);
  const boxMin = new THREE.Vector3(boxCoordinates[0], boxCoordinates[1], boxCoordinates[2]);
  const boxMax = new THREE.Vector3(boxCoordinates[3], boxCoordinates[4], boxCoordinates[5]);
  const fragBox = new THREE.Box3(boxMin, boxMax);
  return fragBox;
}
```

And last, we fit the view based on the boxes we find (merged into a single box)

```js
let fits = await viewer.navigation.fitBounds(false, box);
```

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by

João Martins [in/jpornelas](<[http://twitter.com/JooPaulodeOrne2](https://www.linkedin.com/in/jpornelas/)>), [APS Partner Development](http://aps.autodesk.com)
