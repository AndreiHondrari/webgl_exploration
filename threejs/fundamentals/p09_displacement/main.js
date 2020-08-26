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

    // get DOM elements
    this.jqCanvas = $("#canvas");
    this.canvas = this.jqCanvas[0];
    this.jqWrapper = $("#canvas-wrapper");

    // basic utilities
    this.clock = new THREE.Clock();

    // add a scene (where we add our objects)
    this.scene = new THREE.Scene();

    // create a renderer
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});

    // create helpers
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

    // controls
    this.controls = this.selectControls(CONTROLS.ORBIT);

    // loaders
    this.objLoader = new OBJLoader2();
    this.mtlLoader = new MTLLoader();

    this.textureLoader = new THREE.TextureLoader();
    this.tgaLoader = new TGALoader();

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
        console.log("Loaded successfully");
        callback(root);
      },

    	// called when loading is in progresses
    	function(xhr) {
        let loadPercentage = ( xhr.loaded / xhr.total * 100 );
    		console.log(`${loadPercentage}% loaded`);
    	},
    	// called when loading has errors
    	function(error) {
    		console.log("An error happened");
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

  buildSceneGraph() {
    const self = this;

    const skyboxTexture = this.textureLoader.load('../../textures/planets_textures/8k_stars_milky_way.jpg');

    const HIGH_RES = true;
    let resolution = '2k';
    if (HIGH_RES) {
      resolution = '8k';
    }

    const earthTexture = this.textureLoader.load(`../../textures/planets_textures/${resolution}_earth_daymap.jpg`);
    const earthNormalTexture = this.textureLoader.load(`../../textures/planets_textures/${resolution}_earth_normal_map.tif`);
    const earthSpecularTexture = this.textureLoader.load(`../../textures/planets_textures/${resolution}_earth_specular_map.tif`);
    const earthDisplacementTexture = this.textureLoader.load(`../../textures/planets_textures/${resolution}_earth_displacement_map.png`);
    const earthNightTexture = this.textureLoader.load(`../../textures/planets_textures/${resolution}_earth_nightmap_grayscale.jpg`);

    const earthCloudsTexture = this.textureLoader.load('../../textures/planets_textures/8k_earth_clouds.jpg');

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
    const PLDIST = 500;
    pointLight.position.set(PLDIST, 0, 0);
    pointLight2.position.set(-PLDIST, 0, 0);
    const ambientLight = new THREE.AmbientLight(0xa0a0a0, 1);

    // this.scene.add(ambientLight);
    this.scene.add(pointLight);
    // this.scene.add(pointLight2);

    // world map
    const worldMapMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      emissive: new THREE.Color(10, 10, 8),
      emissiveMap: earthNightTexture,
      emissiveIntensity: 0.1,
      // normalMap: earthNormalTexture,
      bumpMap: earthDisplacementTexture,
      displacementMap: earthDisplacementTexture,
      displacementScale: 0.05,
      // side: THREE.DoubleSide,
      // wireframe: true,
    });
    const worldMapGeo = new THREE.SphereBufferGeometry(50, 2000, 2000);
    let worldMap = new THREE.Mesh(worldMapGeo, worldMapMaterial);
    // worldMap.rotation.x = THREE.MathUtils.degToRad(-90);
    // worldMap.rotation.z = THREE.MathUtils.degToRad(45);
    this.scene.add(worldMap);

    // atmosphere
    const atmMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0, 0, 1),
      transparent: true,
      opacity: 0.05,
    });
    const atmGeo = new THREE.SphereBufferGeometry(52, 100, 100);
    const atm = new THREE.Mesh(atmGeo, atmMat);
    this.scene.add(atm);

    // clouds
    let earthCloudsGeo = new THREE.SphereGeometry(53, 50, 50);
    let earthCloudsMaterial = new THREE.MeshStandardMaterial({
      map: earthCloudsTexture,
      alphaMap: earthCloudsTexture,
      transparent: true,
    });
    let earthClouds = new THREE.Mesh(earthCloudsGeo, earthCloudsMaterial);
    this.scene.add(earthClouds)

  }  // END buildSceneGraph
}

const engine = new RenderEngine();
engine.animate();
