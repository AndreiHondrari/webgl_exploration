import * as THREE from '../../vendor/three.js/build/three.module.js';
import { FlyControls } from '../../vendor/three.js/examples/jsm/controls/FlyControls.js';
import { OrbitControls } from '../../vendor/three.js/examples/jsm/controls/OrbitControls.js';
import { OBJLoader2 } from '../../vendor/three.js/examples/jsm/loaders/OBJLoader2.js';
import { MTLLoader } from '../../vendor/three.js/examples/jsm/loaders/MTLLoader.js';
import { TGALoader } from '../../vendor/three.js/examples/jsm/loaders/TGALoader.js';
import { MtlObjBridge } from '../../vendor/three.js/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';

const CONTROLS = Object.freeze({
  ORBIT: 1,
  FLY: 2,
});

class RenderEngine {

  constructor() {
    // state
    this.objects = {};
    this.textures = {};
    this.models = {};

    // get DOM elements
    this.jqCanvas = $("#canvas");
    this.canvas = this.jqCanvas[0];
    this.jqWrapper = $("#canvas-wrapper");
    this.splash = $(".splash");
    this.splashProgress = $("#splash-progress");

    // basic utilities
    this.clock = new THREE.Clock();

    // add a scene (where we add our objects)
    this.scene = new THREE.Scene();

    // create a renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,

      preserveDrawingBuffer: true,
    });

    // initialize & setup additionals
    let loadPromise = this._initLoaders();
    this._setupHelpers();
    this._setupCameras();

    // controls
    this.controls = this._createControls(CONTROLS.ORBIT);

    loadPromise.then(() => {
      console.log("[ENGINE] Finished preparation");
      console.log("[ENGINE] Build scene graph");
      this.buildSceneGraph();
    });

    this._prepare();
  }

  _initLoaders() {
    const thisEngine = this;

    this.loadManager = new THREE.LoadingManager();
    this.objLoader = new OBJLoader2(this.loadManager);
    this.mtlLoader = new MTLLoader(this.loadManager);

    this.textureLoader = new THREE.TextureLoader(this.loadManager);
    this.tgaLoader = new TGALoader(this.loadManager);

    this.loadManager.onStart = function(url, itemsLoaded, itemsTotal) {
        console.log(`[LOADING_MANAGER]: Started loading "${url}"`);
    };

    this.loadManager.onProgress = function(url, itemsLoaded, itemsTotal) {
        console.log(`[LOADING_MANAGER]: Loaded "${itemsLoaded}" of "${itemsTotal}"`);
        if (thisEngine.splashProgress !== undefined) {
          let progressPercentage = (itemsLoaded / itemsTotal) * 100;
          thisEngine.splashProgress.val(progressPercentage);
          thisEngine.splashProgress.text(`${progressPercentage}%`);
          if (progressPercentage === 100) {
            thisEngine.splash.hide();
          }
        }
    };

    return new Promise((resolveFunction) => {
      this.loadManager.onLoad = function() {
          console.log("[LOADING_MANAGER]: Loading completed!");
          resolveFunction();
      };
    });
  }

  _setupHelpers() {
    this.gridHelper = new THREE.GridHelper(3000, 20, new THREE.Color('red'));

    const ARROW_LENGTH = 100;
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

    // this.scene.add(this.gridHelper);
    this.scene.add(this.axesGroup);
  }

  _setupCameras() {
    // add a camera
    // THREE.PerspectiveCamera(fov, aspect, near, far)
    this.cameraRatio = this.width/this.height
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.cameraRatio,
      0.1,
      1_000_000
    );

    // position the camera
    const XZ = 75;
    this.camera.position.x = XZ;
    this.camera.position.y = 75;
    this.camera.position.z = XZ;
  }

  // utilities
  _createControls(controller) {
    switch(controller) {
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

  loadObj(objPath, callback = function(){}) {
    const self = this;
    this.objLoader.load(
      objPath,

      // called when resource is loaded
      function(root) {
        console.log(`[MODEL] [${objPath}] Loaded successfully`);
        callback(root);
      },

    	// called when loading is in progresses
    	function(xhr) {
        let loadPercentage = ( xhr.loaded / xhr.total * 100 );
    		console.log(`[MODEL] [${objPath}] ${loadPercentage}% loaded`);
    	},
    	// called when loading has errors
    	function(error) {
    		console.log(`[MODEL] [${objPath}] An error happened`);
    	}
    );
  }

  loadMtl(mtlPath, callbackDone = function(){}) {
    const self = this;
    this.mtlLoader.load(mtlPath, (mtlParseResult) => {
      const materials = MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
      self.objLoader.addMaterials(materials);
      callbackDone();
    });
  }

  loadObjModel(objPath, mtlPath = null, callback = function(){}) {
    if (mtlPath === null) {
      this.loadObj(objPath, callback);
    } else {
      this.loadMtl(mtlPath, () => {
        this.loadObj(objPath, callback);
      });
    }
  }

  _prepare() {
    this.loadTextures();
    this.loadModels();
  }

  _afterPrepare() {
    console.log("[ENGINE] Performing post-preparation!");
    return new Promise(this.afterPrepare.bind(this));
  }

  _loadTextures() {
    // make a promise to load all textures
    console.log("[ENGINE] Load textures");
    return new Promise(() => {
      this.loadTextures();
    });
  }

  _loadModels() {
    // make a promise to load all models
    console.log("[ENGINE] Load models");
    return new Promise(() => {
      this.loadModels();
    });
  }

  loadTextures() {
    const TEXTURES_DIR = "../../textures";

    this.textures.skyboxTexture = this.textureLoader.load(`${TEXTURES_DIR}/planets_textures/8k_stars_milky_way.jpg`);

    const WHITE_MARBLE_LOC = `${TEXTURES_DIR}/white_marble`;
    this.textures.whiteMarbleColorTexture = this.tgaLoader.load(`${WHITE_MARBLE_LOC}/white_marble_03_2k_baseColor.tga`)
    this.textures.whiteMarbleHeightTexture = this.tgaLoader.load(`${WHITE_MARBLE_LOC}/white_marble_03_2k_height.tga`)
    this.textures.whiteMarbleGlossinessTexture = this.tgaLoader.load(`${WHITE_MARBLE_LOC}/white_marble_03_2k_glossiness.tga`)
    this.textures.whiteMarbleRoughnessTexture = this.tgaLoader.load(`${WHITE_MARBLE_LOC}/white_marble_03_2k_roughness.tga`)
    this.textures.whiteMarbleSpecularTexture = this.tgaLoader.load(`${WHITE_MARBLE_LOC}/white_marble_03_2k_specular.tga`)
    this.textures.whiteMarbleNormalTexture = this.tgaLoader.load(`${WHITE_MARBLE_LOC}/white_marble_03_2k_normal.tga`)
    this.textures.cobbleStoneTexture = this.tgaLoader.load(`${TEXTURES_DIR}/cobblestone/CobbleStone_03_BC.tga`);
    const cobbleStoneDisplacementTexture = this.tgaLoader.load(`${TEXTURES_DIR}/cobblestone/CobbleStone_03_H.tga`);
    const cobbleStoneNormalTexture = this.tgaLoader.load(`${TEXTURES_DIR}/cobblestone/CobbleStone_03_N.tga`);
  }

  loadModels() {
    this.loadObjModel(
      '../../models/column_1.obj',
      '../../models/column_1.mtl',
      (loadedNode) => {
        this.models.column = loadedNode;
      }
    )
  }

  afterPrepare() {

  }

  buildSceneGraph() {
    const self = this;

    // skybox
    const SKYBOX_EMISSIVE_COLOR_LEVEL = 1;
    const skyboxGeometry = new THREE.SphereGeometry(50_000, 100, 100);
    const skyboxMaterial = new THREE.MeshStandardMaterial({
      map: this.textures.skyboxTexture,
      emissiveMap: this.textures.skyboxTexture,
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

    // floor
    const FLOOR_SIDE = 500;
    const floorGeo = new THREE.PlaneGeometry(FLOOR_SIDE, FLOOR_SIDE, 200, 200);
    let cobbleStoneTextureClone1 = this.textures.cobbleStoneTexture.clone();
    cobbleStoneTextureClone1.needsUpdate = true;
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: cobbleStoneTextureClone1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMaterial);
    floor.rotation.x = THREE.MathUtils.degToRad(-90);
    this.scene.add(floor);

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

  }  // END buildSceneGraph
}

const engine = new RenderEngine();
engine.animate();
