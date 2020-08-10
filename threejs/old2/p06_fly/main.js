import * as THREE from '../vendor/three.module.js';
import BasicPlayer from '../tools/basic_player/basic_player.mjs';
import GridPlugin from '../tools/basic_player/plugins/grid.mjs';

import {
  Size, Engine,
} from "../tools/engine.mjs";

import {sceneGraphInit} from './scenegraph.mjs';

const ROTATION_RATE = 0.025;

const INITIAL_CAMERA_X = 0;
const INITIAL_CAMERA_Y = 2;
const INITIAL_CAMERA_Z = 25;

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

const playerPlugins = [
  ["baseGrid", GridPlugin],
];

const player = new BasicPlayer({
  engine,
  plugins: playerPlugins,
});
player.populateInterface(jqWrapper[0]);

// engine use
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
  mainCamera.position.z = INITIAL_CAMERA_Z;
  mainCamera.position.y = INITIAL_CAMERA_Y;

  this.addCamera("perspectiveCamera1", mainCamera);
  this.activateCamera("perspectiveCamera1");
}

function preDraw(engine) {
  player.alterNodes();

  const objectName = "hearthexagon";

  if (engine.state["rotateRight"]) {
    engine.nodes[objectName].rotation.y = Math.round((engine.nodes[objectName].rotation.y + ROTATION_RATE) * 100) / 100;
  }

  if (engine.state["rotateLeft"]) {
    engine.nodes[objectName].rotation.y = Math.round((engine.nodes[objectName].rotation.y - ROTATION_RATE) * 100) / 100;;
  }

  if (engine.state["rotateUp"]) {
    engine.nodes[objectName].rotation.x = Math.round((engine.nodes[objectName].rotation.x + ROTATION_RATE) * 100) / 100;
  }

  if (engine.state["rotateDown"]) {
    engine.nodes[objectName].rotation.x = Math.round((engine.nodes[objectName].rotation.x - ROTATION_RATE) * 100) / 100;
  }
}

engine.setSceneGraphInitCallback(sceneGraphInit);
engine.setCamerasInitCallback(camerasInit);
engine.setPreDrawCallback(preDraw)
engine.initialize();

player.installedPlugins["baseGrid"].enablePlugin();

engine.startAnimation();
