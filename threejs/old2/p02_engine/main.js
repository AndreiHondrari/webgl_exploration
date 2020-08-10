import * as THREE from '../vendor/three.module.js';

import {
  Size, Engine,
} from "../tools/engine.mjs";

const ROTATION_RATE = 0.1;

const INITIAL_CAMERA_X = 0;
const INITIAL_CAMERA_Y = 0;
const INITIAL_CAMERA_Z = 50;

const INITIAL_LIGHT_X = 10;
const INITIAL_LIGHT_Y = 10;
const INITIAL_LIGHT_Z = 50;

const INITIAL_BOX_ROTATION_X = 0.5;
const INITIAL_BOX_ROTATION_Y = 0.8;

// canvas acquisition
const jqCanvas = $("#canvas");
const canvas = jqCanvas[0];
const jqWrapper = $("#canvas-wrapper");
const canvasSize = new Size(jqWrapper.innerWidth(), jqWrapper.innerHeight());

// engine use
function sceneGraphInit(engine) {
  console.log("SCENE GRAPH INIT");

  // create a box
  const box1geometry = new THREE.BoxGeometry(20, 20, 20);
  const material = new THREE.MeshLambertMaterial({color: 0xfd59d7});
  var box1 = new THREE.Mesh(box1geometry, material);

  box1.rotation.y = INITIAL_BOX_ROTATION_Y;

  engine.addNode("box1", box1);

  // add light
  const pointLight = new THREE.PointLight(0xFFFF00);
  pointLight.position.set(INITIAL_LIGHT_X, INITIAL_LIGHT_Y, INITIAL_LIGHT_Z);
  engine.addNode("light1", pointLight);
}

function camerasInit(engine) {
  console.log("CAMERAS INIT");

  // THREE.PerspectiveCamera(fov, aspect, near, far)
  const mainCamera = new THREE.PerspectiveCamera(
      75,  // fov
      canvasSize.width/canvasSize.height, // aspect
      0.1, // near
      100 // far
  );

  // initially camera points on the Z axis (towards the XY plane)
  // at the altitude of 0 -> that's why we need to shift the camera upwards
  mainCamera.position.z = INITIAL_CAMERA_Z

  this.addCamera("perspectiveCamera1", mainCamera);
  this.activateCamera("perspectiveCamera1");
}

const engine = new Engine({
    canvas,
    size: canvasSize,
    sceneGraphInit,
    camerasInit,
});

engine.initialize();
engine.draw();
