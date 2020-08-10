import * as THREE from '../../vendor/three.js/build/three.module.js';

// get DOM elements
var jqCanvas = $("#canvas");
var canvas = jqCanvas[0];
var jqWrapper = $("#canvas-wrapper");
var width = jqWrapper.innerWidth();
var height = jqWrapper.innerHeight();
console.log("CANVAS SIZE", width, height);

// add a scene (where we add our objects)
var scene = new THREE.Scene();

// create a renderer
var renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(width, height);

// add a camera
// THREE.PerspectiveCamera(fov, aspect, near, far)
var camera = new THREE.PerspectiveCamera(
  75,
  width/height,
  0.1,
  1000
);

// place the camera at z of 100
camera.position.z = 50;

// add light
const pointLight = new THREE.PointLight(0xFFFF00);
pointLight.position.set(0, 0, 30);

// create a box
const box1geometry = new THREE.BoxGeometry(20, 20, 20);
const material = new THREE.MeshLambertMaterial({color: 0xfd59d7});
var box1 = new THREE.Mesh(box1geometry, material);

box1.rotation.x = 0.5;
box1.rotation.y = 1;
box1.rotation.z = 0;

// add nodes to scene
scene.add(pointLight);
scene.add(box1);

// Finally render
renderer.render(scene, camera);
