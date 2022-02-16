import * as THREE from "three";
import { FlyControls } from "../../vendor/three.js/examples/jsm/controls/FlyControls.js";
import { OrbitControls } from "../../vendor/three.js/examples/jsm/controls/OrbitControls.js";

const CONTROLLERS = Object.freeze({
  ORBIT: 1,
  FLY: 2,
});

// utilities
function selectController(controller, camera, canvas) {
  switch (controller) {
    case CONTROLLERS.ORBIT:
      return new OrbitControls(camera, canvas);
    case CONTROLLERS.FLY:
      var flyControls = new FlyControls(camera, canvas);
      flyControls.movementSpeed = 10;
      flyControls.domElement = renderer.domElement;
      flyControls.rollSpeed = Math.PI / 12;
      flyControls.autoForward = false;
      flyControls.dragToLook = false;
      return flyControls;
  }
}

// get DOM elements
var jqCanvas = $("#canvas");
var canvas = jqCanvas[0];
var jqWrapper = $("#canvas-wrapper");
var width = jqWrapper.innerWidth();
var height = jqWrapper.innerHeight();
console.log("CANVAS SIZE", width, height);

// basic utilities
var clock = new THREE.Clock();

// add a scene (where we add our objects)
var scene = new THREE.Scene();

// create a renderer
var renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(width, height);

// create helpers
var gridHelper = new THREE.GridHelper(100, 50, new THREE.Color("red"));

const ARROW_LENGTH = 15;
var absoluteOrigin = new THREE.Vector3(0, 0, 0);
var xDir = new THREE.Vector3(1, 0, 0);
var yDir = new THREE.Vector3(0, 1, 0);
var zDir = new THREE.Vector3(0, 0, 1);

var arrowX = new THREE.ArrowHelper(xDir, absoluteOrigin, ARROW_LENGTH, "red");
var arrowY = new THREE.ArrowHelper(yDir, absoluteOrigin, ARROW_LENGTH, "green");
var arrowZ = new THREE.ArrowHelper(zDir, absoluteOrigin, ARROW_LENGTH, "blue");

var axesGroup = new THREE.Group();
axesGroup.add(arrowX);
axesGroup.add(arrowY);
axesGroup.add(arrowZ);

// add a camera
// THREE.PerspectiveCamera(fov, aspect, near, far)
var camera = new THREE.PerspectiveCamera(
  75,
  width / height,
  0.1,
  1000,
);

// controls
const controls = selectController(CONTROLLERS.ORBIT, camera, canvas);

// place the camera at z of 100
const XZ = 15;
camera.position.x = XZ;
camera.position.y = 15;
camera.position.z = XZ;

camera.rotateY(THREE.MathUtils.degToRad(45));
camera.rotateX(THREE.MathUtils.degToRad(-25));

// add light
const pointLight = new THREE.PointLight(0xFFFF00);
pointLight.position.set(10, 20, 30);

// create a box
const box1geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshStandardMaterial({ color: 0xfd59d7 });
var box1 = new THREE.Mesh(box1geometry, material);

box1.position.y = 5;

// post-alteration
// camera.lookAt(box1.position);

// add nodes to scene
scene.add(gridHelper);
scene.add(axesGroup);
scene.add(pointLight);
scene.add(box1);

function render() {
  var delta = clock.getDelta();
  controls.update(delta);

  // Finally render
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}
animate();
