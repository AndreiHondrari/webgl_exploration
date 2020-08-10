import * as THREE from '../vendor/three.module.js';
import BasicPlayer from '../tools/basic_player.mjs';

import {
  Size, Engine,
} from "../tools/engine.mjs";


const ROTATION_RATE = 0.025;

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

// define engine
const engine = new Engine({
    canvas,
    size: canvasSize,
});

const player = new BasicPlayer(engine);
player.populateInterface(jqWrapper[0]);

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
      2, // near
      1000 // far
  );

  // initially camera points on the Z axis (towards the XY plane)
  // at the altitude of 0 -> that's why we need to shift the camera upwards
  mainCamera.position.z = INITIAL_CAMERA_Z

  this.addCamera("perspectiveCamera1", mainCamera);
  this.activateCamera("perspectiveCamera1");
}

function preDraw(engine) {
  player.alterNodes();

  if (engine.state["rotateRight"]) {
    engine.nodes['box1'].rotation.y = Math.round((engine.nodes['box1'].rotation.y + ROTATION_RATE) * 100) / 100;
  }

  if (engine.state["rotateLeft"]) {
    engine.nodes['box1'].rotation.y = Math.round((engine.nodes['box1'].rotation.y - ROTATION_RATE) * 100) / 100;;
  }

  if (engine.state["rotateUp"]) {
    engine.nodes['box1'].rotation.x = Math.round((engine.nodes['box1'].rotation.x + ROTATION_RATE) * 100) / 100;
  }

  if (engine.state["rotateDown"]) {
    engine.nodes['box1'].rotation.x = Math.round((engine.nodes['box1'].rotation.x - ROTATION_RATE) * 100) / 100;
  }
}

engine.setSceneGraphInitCallback(sceneGraphInit);
engine.setCamerasInitCallback(camerasInit);
engine.setPreDrawCallback(preDraw)
engine.initialize();

engine.startAnimation();
