import * as THREE from '../../vendor/three.js/build/three.module.js';
import { FlyControls } from '../../vendor/three.js/examples/jsm/controls/FlyControls.js';
import { OrbitControls } from '../../vendor/three.js/examples/jsm/controls/OrbitControls.js';

const CONTROLS = Object.freeze({
  ORBIT: 1,
  FLY: 2,
});

const DISTANCE_ABOVE_GRID = 10;

class RenderEngine {

  constructor() {
    // state
    this.objectsToRotate = [];
    this.currentRotation = 0;

    // get DOM elements
    this.jqCanvas = $("#canvas");
    this.canvas = this.jqCanvas[0];
    this.jqWrapper = $("#canvas-wrapper");
    this.width = this.jqWrapper.innerWidth();
    this.height = this.jqWrapper.innerHeight();
    console.log("CANVAS SIZE", this.width, this.height);

    // basic utilities
    this.clock = new THREE.Clock();

    // add a scene (where we add our objects)
    this.scene = new THREE.Scene();

    // create a renderer
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setSize(this.width, this.height);

    // create helpers
    this.gridHelper = new THREE.GridHelper(100, 50, new THREE.Color('red'));

    const ARROW_LENGTH = 15;
    var absoluteOrigin = new THREE.Vector3(0, 0, 0);
    var xDir = new THREE.Vector3(1, 0, 0);
    var yDir = new THREE.Vector3(0, 1, 0);
    var zDir = new THREE.Vector3(0, 0, 1);

    var arrowX = new THREE.ArrowHelper(xDir, absoluteOrigin, ARROW_LENGTH, "red");
    var arrowY = new THREE.ArrowHelper(yDir, absoluteOrigin, ARROW_LENGTH, "green");
    var arrowZ = new THREE.ArrowHelper(zDir, absoluteOrigin, ARROW_LENGTH, "blue");

    this.axesGroup = new THREE.Group();
    this.axesGroup.add(arrowX);
    this.axesGroup.add(arrowY);
    this.axesGroup.add(arrowZ);

    this.scene.add(this.gridHelper);
    this.scene.add(this.axesGroup);

    // add a camera
    // THREE.PerspectiveCamera(fov, aspect, near, far)
    this.cameraRatio = this.width/this.height
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.cameraRatio,
      0.1,
      1000
    );

    // place the camera at z of 100
    const XZ = 35;
    // this.camera.position.x = XZ;
    this.camera.position.y = 75;
    // this.camera.position.z = XZ;

    // controls
    this.controls = this.selectControls(CONTROLS.ORBIT);

    this.buildSceneGraph();
  }

  // utilities
  selectControls(controller) {
    switch(controller) {
      case CONTROLS.ORBIT:
        return new OrbitControls(this.camera, this.canvas);
      case CONTROLS.FLY:
        var flyControls = new FlyControls(this.camera, this.canvas);
        flyControls.movementSpeed = 10;
        flyControls.domElement = renderer.domElement;
        flyControls.rollSpeed = Math.PI / 12;
        flyControls.autoForward = false;
        flyControls.dragToLook = false;
        return flyControls;
    }
  }

  render() {
    var delta = this.clock.getDelta();
    this.controls.update(delta);

    // Finally render
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
  	requestAnimationFrame(this.animate.bind(this));
    this.specialRotate();
  	this.render();
  }

  specialRotate() {
    const self = this;

    const yVector = new THREE.Vector3(1, 0, 1).normalize();

    this.objectsToRotate.forEach(function(obj) {
      const orientationVector = obj.position.clone();
      obj.rotateOnWorldAxis(yVector, -THREE.Math.degToRad(0.5));
    });
  }

  buildSceneGraph() {
    // add light
    const pointLight = new THREE.PointLight(0xffffff, 0.1, 500, 0);
    pointLight.position.set(30, 50, 50);

    const pointLight2 = new THREE.PointLight(0xffffff, 1, 550, 1);
    pointLight2.position.set(-50, -50, -50);

    // create a box
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0, 0, 20),
      metalness: 0.5,
      roughness: 0.1,
    });
    const box1geometry = new THREE.BoxGeometry(10, 10, 10);
    const box1 = new THREE.Mesh(box1geometry, boxMaterial);
    box1.position.y = DISTANCE_ABOVE_GRID;

    // circle
    const circleMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0, 10, 0),
      metalness: 0.5,
      roughness: 0.1,
      side: THREE.DoubleSide,
    });
    const circleGeometry = new THREE.CircleGeometry(5, 25);
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.position.x = 20;
    circle.position.y = DISTANCE_ABOVE_GRID;
    circle.rotateX(THREE.MathUtils.degToRad(90));

    // cone
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(10, 0, 0),
      metalness: 0.5,
      roughness: 0.1,
    })
    const coneGeometry = new THREE.ConeGeometry(5, 10, 10);
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.x = -20;
    cone.position.y = DISTANCE_ABOVE_GRID;

    const cylinderMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(10, 10, 0),
      metalness: 0.5,
      roughness: 0.1,
    });
    const cylinderGeometry = new THREE.CylinderGeometry(5, 5, 10, 25);
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.z = 20;
    cylinder.position.y = DISTANCE_ABOVE_GRID;

    // dodecahedron
    const dodecahedronMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0, 10, 10)
    });
    const dodecahedronGeometry = new THREE.DodecahedronGeometry(5);
    const dodecahedron = new THREE.Mesh(
      dodecahedronGeometry,
      dodecahedronMaterial
    );
    dodecahedron.position.y = DISTANCE_ABOVE_GRID;
    dodecahedron.position.z = 20;
    dodecahedron.position.x = -20;

    // dodecahedron
    const dodecahedron2Material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0, 2.5, 5),
      metalness: 0.5,
      roughness: 0.1,
    });
    const dodecahedron2Geometry = new THREE.DodecahedronGeometry(5, 1);
    const dodecahedron2 = new THREE.Mesh(
      dodecahedron2Geometry,
      dodecahedron2Material
    );
    dodecahedron2.position.y = DISTANCE_ABOVE_GRID;
    dodecahedron2.position.z = 20;
    dodecahedron2.position.x = 20;

    // hearthixagond
    const hearthixagondMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(30, 0, 0),
      metalness: 0.5,
      roughness: 0.1,
    });
    const hearthixagondShape = new THREE.Shape();
    const x = -2.5;
    const y = -5;
    hearthixagondShape.moveTo(x + 2.5, y + 2.5);
    hearthixagondShape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    hearthixagondShape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    hearthixagondShape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    hearthixagondShape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
    hearthixagondShape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    hearthixagondShape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

    const hearthixagondGeometry = new THREE.ExtrudeBufferGeometry(hearthixagondShape, {
      steps: 2,
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 1,
      bevelSegment: 1,
    });

    const hearthixagond = new THREE.Mesh(hearthixagondGeometry, hearthixagondMaterial);
    hearthixagond.position.y = DISTANCE_ABOVE_GRID;
    hearthixagond.position.x = -20;
    hearthixagond.position.z = -20;

    // icosahedron
    const icosahedronMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(20, 0, 20),
      metalness: 0.5,
      roughness: 0.1,
    });
    const icosahedronGeometry = new THREE.IcosahedronGeometry(5);
    const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
    icosahedron.position.y = DISTANCE_ABOVE_GRID;
    icosahedron.position.z = -20;

    // lathe shape
    const latheMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(10, 0, 5),
      metalness: 0.5,
      roughness: 0.1,
      side: THREE.DoubleSide,
    });

    const lathePoints = [];
    for (let i = -5; i < 5; ++i) {
      lathePoints.push(new THREE.Vector2(Math.sin(i) * 1 + 3, i))
    }
    const latheGeometry = new THREE.LatheGeometry(lathePoints);
    const lathe = new THREE.Mesh(latheGeometry, latheMaterial);
    lathe.position.y = DISTANCE_ABOVE_GRID;
    lathe.position.x = 20;
    lathe.position.z = -20;

    // octahedron
    const octahedronMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0, 255, 255),
      metalness: 0.5,
      roughness: 0.1,
    });
    const octahedronGeometry = new THREE.OctahedronGeometry(5);
    const octahedron = new THREE.Mesh(octahedronGeometry, octahedronMaterial);
    octahedron.position.y = DISTANCE_ABOVE_GRID;
    octahedron.position.z = -35;

    // tetrahedron
    const tetrahedronMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(40, 10, 5),
      metalness: 0.5,
      roughness: 0.1,
    });
    const tetrahedronGeometry = new THREE.TetrahedronGeometry(5);
    const tetrahedron = new THREE.Mesh(tetrahedronGeometry, tetrahedronMaterial);
    tetrahedron.position.y = DISTANCE_ABOVE_GRID;
    tetrahedron.position.x = -20;
    tetrahedron.position.z = -35;


    // post alterations
    pointLight.lookAt(box1.position);
    pointLight2.lookAt(box1.position);

    // add nodes to scene
    this.scene.add(pointLight);
    this.scene.add(pointLight2);
    this.scene.add(box1);
    this.scene.add(circle);
    this.scene.add(cone);
    this.scene.add(cylinder);
    this.scene.add(dodecahedron);
    this.scene.add(dodecahedron2);
    this.scene.add(hearthixagond);
    this.scene.add(icosahedron);
    this.scene.add(lathe);
    this.scene.add(octahedron);
    this.scene.add(tetrahedron);

    // extra list
    this.objectsToRotate = [
      box1,
      circle,
      cone,
      cylinder,
      dodecahedron,
      dodecahedron2,
      hearthixagond,
      icosahedron,
      lathe,
      octahedron,
      tetrahedron,
    ];
  }
}

const engine = new RenderEngine();
engine.animate();
