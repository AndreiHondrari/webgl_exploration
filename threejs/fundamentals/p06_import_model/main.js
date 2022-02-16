import * as THREE from "../../vendor/three.js/build/three.module.js";
import { FlyControls } from "../../vendor/three.js/examples/jsm/controls/FlyControls.js";
import { OrbitControls } from "../../vendor/three.js/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "../../vendor/three.js/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "../../vendor/three.js/examples/jsm/loaders/MTLLoader.js";

const CONTROLS = Object.freeze({
  ORBIT: 1,
  FLY: 2,
});

const DISTANCE_ABOVE_GRID = 10;

class RenderEngine {
  constructor() {
    // state
    this.objects = {};

    // get DOM elements
    this.jqCanvas = $("#canvas");
    this.canvas = this.jqCanvas[0];
    this.jqWrapper = $("#canvas-wrapper");

    // basic utilities
    this.clock = new THREE.Clock();

    // add a scene (where we add our objects)
    this.scene = new THREE.Scene();

    // create a renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });

    // create helpers
    this.gridHelper = new THREE.GridHelper(3000, 20, new THREE.Color("red"));

    const ARROW_LENGTH = 500;
    var absoluteOrigin = new THREE.Vector3(0, 0, 0);
    var xDir = new THREE.Vector3(1, 0, 0);
    var yDir = new THREE.Vector3(0, 1, 0);
    var zDir = new THREE.Vector3(0, 0, 1);

    var arrowX = new THREE.ArrowHelper(
      xDir,
      absoluteOrigin,
      ARROW_LENGTH,
      "red",
    );
    var arrowY = new THREE.ArrowHelper(
      yDir,
      absoluteOrigin,
      ARROW_LENGTH,
      "green",
    );
    var arrowZ = new THREE.ArrowHelper(
      zDir,
      absoluteOrigin,
      ARROW_LENGTH,
      "blue",
    );

    this.axesGroup = new THREE.Group();
    this.axesGroup.add(arrowX);
    this.axesGroup.add(arrowY);
    this.axesGroup.add(arrowZ);

    // this.scene.add(this.gridHelper);
    // this.scene.add(this.axesGroup);

    // add a camera
    // THREE.PerspectiveCamera(fov, aspect, near, far)
    this.cameraRatio = this.width / this.height;
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.cameraRatio,
      0.1,
      1_000_000,
    );

    // position the camera
    const XZ = 75;
    this.camera.position.x = -XZ;
    this.camera.position.y = 75;
    this.camera.position.z = XZ;

    // controls
    this.controls = this.selectControls(CONTROLS.ORBIT);

    // loaders
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();

    this.buildSceneGraph();
  }

  // utilities
  selectControls(controller) {
    switch (controller) {
      case CONTROLS.ORBIT:
        return new OrbitControls(this.camera, this.canvas);
      case CONTROLS.FLY:
        var flyControls = new FlyControls(this.camera, this.canvas);
        flyControls.movementSpeed = 10;
        flyControls.domElement = this.renderer.domElement;
        flyControls.rollSpeed = Math.PI / 12;
        flyControls.autoForward = false;
        flyControls.dragToLook = true;
        return flyControls;
    }
  }

  resizeRendererToDisplaySize() {
    const canvas = this.renderer.domElement;
    const widthChanged = canvas.width !== canvas.clientWidth;
    const heightChanged = canvas.height !== canvas.clientHeight;

    if (widthChanged || heightChanged) {
      this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  render() {
    var delta = this.clock.getDelta();
    this.controls.update(delta);

    this.resizeRendererToDisplaySize();

    // Finally render
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  loadObj(objPath, callback = function () {}) {
    const self = this;
    this.objLoader.load(
      objPath,
      // called when resource is loaded
      function (root) {
        console.log("Loaded successfully");
        callback(root);
      },
      // called when loading is in progresses
      function (xhr) {
        let loadPercentage = (xhr.loaded / xhr.total * 100);
        console.log(`${loadPercentage}% loaded`);
      },
      // called when loading has errors
      function (error) {
        console.log("An error happened");
      },
    );
  }

  loadMtl(mtlPath, callbackDone = function () {}) {
    const self = this;
    this.mtlLoader.load(mtlPath, (materials) => {
      materials.preload();

      self.objLoader.setMaterials(materials);

      callbackDone();
    });
  }

  loadObjModel(objPath, mtlPath = null, callback = function () {}) {
    if (mtlPath === null) {
      this.loadObj(objPath, callback);
    } else {
      this.loadMtl(mtlPath, () => {
        this.loadObj(objPath, callback);
      });
    }
  }

  buildSceneGraph() {
    const self = this;
    const SPHERE_DETAIL = 100;

    const loader = new THREE.TextureLoader();
    const skyboxTexture = loader.load(
      "../../textures/planets_textures/8k_stars_milky_way.jpg",
    );

    // skybox
    const SKYBOX_EMISSIVE_COLOR_LEVEL = 1;
    const skyboxGeometry = new THREE.SphereGeometry(50_000, 100, 100);
    const skyboxMaterial = new THREE.MeshStandardMaterial({
      map: skyboxTexture,
      emissiveMap: skyboxTexture,
      emissive: new THREE.Color(
        SKYBOX_EMISSIVE_COLOR_LEVEL,
        SKYBOX_EMISSIVE_COLOR_LEVEL,
        SKYBOX_EMISSIVE_COLOR_LEVEL,
      ),
      emissiveIntensity: 1,
      side: THREE.DoubleSide,
    });
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    this.scene.add(skybox);

    // add light
    const pointLight = new THREE.PointLight(0xffffff, 1);
    const pointLight2 = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(1000, 1000, 1000);
    pointLight2.position.set(1000, 1000, -1000);
    const ambientLight = new THREE.AmbientLight(0xa0a0a0, 0.2);

    this.scene.add(ambientLight);
    this.scene.add(pointLight);
    this.scene.add(pointLight2);

    // sphere
    // const sphereGeo = new THREE.SphereGeometry(5, 50, 50);
    // const sphereMat = new THREE.MeshStandardMaterial({
    //   color: new THREE.Color(255, 255, 255),
    // });
    // let sphere = new THREE.Mesh(sphereGeo, sphereMat);
    // sphere.position.z = 100;
    // this.scene.add(sphere);

    this.loadObjModel(
      "../../models/star_wars_tie_fighter.obj",
      "../../models/star_wars_tie_fighter.mtl",
      (loadedNode) => {
        const SHIP_SCALE = 10;
        loadedNode.scale.copy(
          new THREE.Vector3(SHIP_SCALE, SHIP_SCALE, SHIP_SCALE),
        );
        self.scene.add(loadedNode);
        console.log(loadedNode);

        // root.material.emissive = new THREE.Color(255, 255, 255);
        self.objects.fighter = loadedNode;
      },
    );
  }
}

const engine = new RenderEngine();
engine.animate();
