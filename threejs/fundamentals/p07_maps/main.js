import * as THREE from "../../vendor/three.js/build/three.module.js";
import { FlyControls } from "../../vendor/three.js/examples/jsm/controls/FlyControls.js";
import { OrbitControls } from "../../vendor/three.js/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "../../vendor/three.js/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "../../vendor/three.js/examples/jsm/loaders/MTLLoader.js";
import { TGALoader } from "../../vendor/three.js/examples/jsm/loaders/TGALoader.js";

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

    const ARROW_LENGTH = 100;
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
    this.scene.add(this.axesGroup);

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
    this.camera.position.x = XZ;
    this.camera.position.y = 75;
    this.camera.position.z = XZ;

    // controls
    this.controls = this.selectControls(CONTROLS.ORBIT);

    // loaders
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();

    this.textureLoader = new THREE.TextureLoader();
    this.tgaLoader = new TGALoader();

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

    const skyboxTexture = this.textureLoader.load(
      "../../textures/planets_textures/8k_stars_milky_way.jpg",
    );

    const WHITE_MARBLE_LOC = "../../textures/white_marble";
    const whiteMarbleColorTexture = this.tgaLoader.load(
      `${WHITE_MARBLE_LOC}/white_marble_03_2k_baseColor.tga`,
    );
    const whiteMarbleHeightTexture = this.tgaLoader.load(
      `${WHITE_MARBLE_LOC}/white_marble_03_2k_height.tga`,
    );
    const whiteMarbleGlossinessTexture = this.tgaLoader.load(
      `${WHITE_MARBLE_LOC}/white_marble_03_2k_glossiness.tga`,
    );
    const whiteMarbleRoughnessTexture = this.tgaLoader.load(
      `${WHITE_MARBLE_LOC}/white_marble_03_2k_roughness.tga`,
    );
    const whiteMarbleSpecularTexture = this.tgaLoader.load(
      `${WHITE_MARBLE_LOC}/white_marble_03_2k_specular.tga`,
    );
    const whiteMarbleNormalTexture = this.tgaLoader.load(
      `${WHITE_MARBLE_LOC}/white_marble_03_2k_normal.tga`,
    );

    const cobblestone1bcTexture = this.tgaLoader.load(
      "../../textures/cobblestone/CobbleStone_01_BC.tga",
    );

    const dirt1Texture = this.textureLoader.load(
      "../../textures/ground/Dirt02_04_2K_Albedo.jpg",
    );
    const dirt1DisplacementTexture = this.textureLoader.load(
      "../../textures/ground/Dirt02_04_2K_Displacement.png",
    );
    const dirt1GlossTexture = this.textureLoader.load(
      "../../textures/ground/Dirt02_04_2K_Gloss.png",
    );
    const dirt1NormalTexture = this.textureLoader.load(
      "../../textures/ground/Dirt02_04_2K_Normal.png",
    );

    const squareMapTexture = this.textureLoader.load(
      "../../textures/square_map.png",
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
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    const pointLight2 = new THREE.PointLight(0xffffff, 1);
    const PLDIST = 100;
    pointLight.position.set(PLDIST, PLDIST, PLDIST);
    pointLight2.position.set(100, 100, -100);
    const ambientLight = new THREE.AmbientLight(0xa0a0a0, 1);

    // this.scene.add(ambientLight);
    this.scene.add(pointLight);
    this.scene.add(pointLight2);

    // materials
    const whiteMarbleMat = new THREE.MeshStandardMaterial({
      map: whiteMarbleColorTexture,
      bumpMap: whiteMarbleHeightTexture,
      roughnessMap: whiteMarbleRoughnessTexture,
      displacementMap: whiteMarbleHeightTexture,
      displacementScale: 0.7,
      displacementBias: -0.5,
      normalMap: whiteMarbleNormalTexture,
      // wireframe: true,
    });

    const cobbleStoneMat = new THREE.MeshStandardMaterial({
      map: cobblestone1bcTexture,

      displacementMap: squareMapTexture,
      displacementScale: 10,
      displacementBias: -10,
      side: THREE.DoubleSide,
      // wireframe:true
    });

    const DIRT1_INT = 0.5;
    const dirt1Material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(DIRT1_INT, DIRT1_INT, DIRT1_INT),
      map: dirt1Texture,
      bumpMap: dirt1DisplacementTexture,
      displacementMap: dirt1DisplacementTexture,
      displacementScale: 5,
      normalMap: dirt1NormalTexture,
      normalScale: new THREE.Vector2(0.5, 0.5),
      // wireframe: true,
    });

    // common
    const boxGeo = new THREE.BoxGeometry(75, 75, 75, 200, 200, 200);

    // floor
    const FLOOR_SIDE = 1000;
    const floorGeo = new THREE.PlaneGeometry(FLOOR_SIDE, FLOOR_SIDE, 500, 500);
    const floor = new THREE.Mesh(floorGeo, dirt1Material);
    floor.position.y = -100;
    floor.rotation.x = THREE.MathUtils.degToRad(-90);
    this.scene.add(floor);

    // box1
    let box1 = new THREE.Mesh(boxGeo, whiteMarbleMat);
    box1.position.z = 150;
    this.scene.add(box1);

    // box2
    let box2 = new THREE.Mesh(boxGeo, cobbleStoneMat);
    box2.position.z = -150;
    this.scene.add(box2);

    // sphere
    const sphereGeo = new THREE.SphereGeometry(50, 100, 100);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(255, 255, 255),
      wireframe: true,
    });
    let sphere = new THREE.Mesh(sphereGeo, whiteMarbleMat);
    // sphere.position.z = 100;
    this.scene.add(sphere);

    // plane
    const planeGeo = new THREE.PlaneGeometry(100, 100, 100, 100);
    let plane = new THREE.Mesh(planeGeo, cobbleStoneMat);
    plane.rotation.y = THREE.MathUtils.degToRad(90);
    plane.position.y = 120;
    this.scene.add(plane);
  } // END buildSceneGraph
}

const engine = new RenderEngine();
engine.animate();
