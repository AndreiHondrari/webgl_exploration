import * as THREE from '../vendor/three.module.js';

const INITIAL_LIGHT_X = 10;
const INITIAL_LIGHT_Y = 10;
const INITIAL_LIGHT_Z = 50;

function sceneGraphInit(engine) {
  console.log("SCENE GRAPH INIT");

  // grid
  var gridHelper = new THREE.GridHelper(100, 50, new THREE.Color('red'));
  engine.addNode("grid", gridHelper);

  // hearthhexagon
  let hearthexagonShape = new THREE.Shape();
  const x = -2.5;
  const y = -5;
  hearthexagonShape.moveTo(x + 2.5, y + 2.5);
  hearthexagonShape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
  hearthexagonShape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
  hearthexagonShape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
  hearthexagonShape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
  hearthexagonShape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
  hearthexagonShape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

  let extrudeSettings = {
    steps: 2,
    depth: 2,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 1,
    bevelSegments: 2,
  };
  const hearthexagonGeometry = new THREE.ExtrudeBufferGeometry(hearthexagonShape, extrudeSettings);

  const material = new THREE.MeshLambertMaterial({color: 0xfd59d7});
  const hearthexagon = new THREE.Mesh(hearthexagonGeometry, material);
  hearthexagon.position.y=5;
  hearthexagon.rotation.x=3;
  // hearthexagon.rotation.y=-0.75;

  engine.addNode("hearthexagon", hearthexagon);

  // add light
  const pointLight = new THREE.PointLight(0xFFFF00);
  pointLight.position.set(INITIAL_LIGHT_X, INITIAL_LIGHT_Y, INITIAL_LIGHT_Z);
  engine.addNode("light1", pointLight);
}

export {sceneGraphInit};
