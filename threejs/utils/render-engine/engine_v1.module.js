import * as THREE from '../../vendor/three.js/build/three.module.js';
import { OBJLoader2 } from '../../vendor/three.js/examples/jsm/loaders/OBJLoader2.js';
import { MTLLoader } from '../../vendor/three.js/examples/jsm/loaders/MTLLoader.js';
import { TGALoader } from '../../vendor/three.js/examples/jsm/loaders/TGALoader.js';
import { MtlObjBridge } from '../../vendor/three.js/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';


class AbstractRenderEngine {

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

    loadPromise.then(() => {
      console.log("[ENGINE] Finished preparation");

      // build scene graph
      let sceneGraphBuildPromise = new Promise((resolveFunction) => {
        console.log("[ENGINE] Performing post-preparation!");
        this.afterPrepare();
        console.log("[ENGINE] Finalized post-preparation!");

        console.log("[ENGINE] Build scene graph");
        this.buildSceneGraph();
        console.log("[ENGINE] Finalized scenegraph building");
        resolveFunction();
      });

      sceneGraphBuildPromise.then(() => {
        // animate
        console.log("[ENGINE] Start rendering");
        this.animate();
      }).catch((e) => {
        console.error(e);
      });
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
    this.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadManager);

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
    if (this.preRender !== undefined)
      this.preRender();

    this.resizeRendererToDisplaySize();

    // Finally render
    this.renderer.render(this.scene, this.camera);

    if (this.postRender !== undefined)
      this.postRender();
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
    this.setupCameras();
  }
}

export { AbstractRenderEngine };
