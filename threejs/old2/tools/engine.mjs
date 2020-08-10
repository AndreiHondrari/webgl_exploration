
import * as THREE from '../vendor/three.module.js';


class Size {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}


class Engine {
  constructor({
    canvas,
    size,
    sceneGraphInit = null,
    camerasInit = null,
    preDraw = null,
    postDraw = null,
    initState = null,
    preAnimate = null,
    postAnimate = null,
  }) {
    // set up engine
    this._size = size;
    this._sceneNodes = {};
    this._cameras = {};
    this._state = {};
    this._selectedCamera = null;
    this._sceneGraphInit = sceneGraphInit;
    this._camerasInit = camerasInit;
    this._preDrawCallback = preDraw;
    this._postDrawCallback = postDraw;
    this._preAnimateCallback = preAnimate;
    this._postAnimateCallback = postAnimate;
    this._initStateCallback = initState;

    // set up WebGL instances
    this._scene = new THREE.Scene();
    this._renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
    });
    this._renderer.setSize(size.width, size.height);

    // flags
    this._initializedSceneGraph = false;
    this._initializedCameras = false;
    this._stateInitialized = false;
    this._hasFirstDraw = false;
  }

  get nodes() {
    return this._sceneNodes;
  }

  get cameras() {
    return this._cameras;
  }

  get selectedCamera(){
    return this._selectedCamera;
  }

  get renderer() {
    return this._renderer;
  }

  get isInitialized() {
    return (
      this._initializedSceneGraph &&
      this._initializedCameras &&
      this._stateInitialized
    );
  }

  get hasFirstDraw() {
    return this._hasFirstDraw;
  }

  get isAnimationRunning() {
    return this._animationRunning;
  }

  get state() {
    return this._state;
  }

  setPreDrawCallback(callback) {
    this._preDrawCallback = callback;
  }

  setSceneGraphInitCallback(callback) {
    this._sceneGraphInit = callback;
  }

  setCamerasInitCallback(callback) {
    this._camerasInit = callback;
  }

  addNode(nodeName, nodeObject) {
    this._scene.add(nodeObject);
    this._sceneNodes[nodeName] = nodeObject;
  }

  removeNode(nodeName) {
    this._scene.remove(this._sceneNodes[nodeName])
    delete this._sceneNodes;
  }

  addCamera(cameraName, cameraObject) {
    this._cameras[cameraName] = cameraObject;
  }

  activateCamera(cameraName) {
    this._selectedCamera = this._cameras[cameraName];
  }

  removeCamera(cameraName) {
    const camera = this._cameras[cameraName];

    if (this._selectedCamera === camera)
      this._selectedCamera = null;

    delete this._cameras[cameraName];
  }

  addStateProperty(statePropertyName, value) {
    this._state[statePropertyName] = value;
  }

  removeStateProperty(statePropertyName) {
    delete this._state[statePropertyName];
  }

  initializeState() {
    if (this._initStateCallback !== null)
      this._initStateCallback(this);

    this._stateInitialized = true;
  }

  initializeSceneGraph() {
    if (this._sceneGraphInit === null)
      return;

    this._sceneGraphInit(this);
    this._initializedSceneGraph = true;
  }

  initializeCameras() {
    if (this._camerasInit === null)
      return;

    this._camerasInit(this);
    this._initializedCameras = true;
  }

  initialize() {
    this.initializeSceneGraph();
    this.initializeCameras();
    this.initializeState();
  }

  draw() {
    if (!this._initializedSceneGraph)
      throw new Error("SceneGraph is not initialized");

    if (this._selectedCamera == null)
      throw new Error("There is no selected camera");

    if (this._preDrawCallback !== null)
      this._preDrawCallback(this);

    this._renderer.render(this._scene, this._selectedCamera);
    this._hasFirstDraw = true;

    if (this._postDrawCallback !== null)
      this._postDrawCallback(this);
  }

  startAnimation() {
    const self = this;

    if (this._animationRunning)
      throw new Error(
        "You can't run animate twice!" +
        "You need to stop the animation first"
      )
    this._animationRunning = true;

    setTimeout(function(){
      self._animateMain.call(self, self);
    }, 0);
  }

  _animateMain() {
    const self = this;

    if (this._preAnimateCallback !== null)
      this._preAnimateCallback(this);

    requestAnimationFrame(function() {
      self._animateMain.call(self, self);
    });
    this.draw();

    if (this._postAnimateCallback !== null)
      this._postAnimateCallback(this);
  }

  stopAnimation() {
    if (!this._animationRunning)
      throw new Error(
        "You can't stop a non-running animation! " +
        "You must start it first!"
      )
    this._animationRunning = false;
  }


}

export {
  Size,
  Engine,
};
