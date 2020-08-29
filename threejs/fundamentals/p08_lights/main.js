import * as THREE from '../../vendor/three.js/build/three.module.js';
import { OrbitControls } from '../../vendor/three.js/examples/jsm/controls/OrbitControls.js';

import { AbstractRenderEngine } from '../../utils/render-engine/engine_v1.module.js';


class RenderEngine extends AbstractRenderEngine {

  preRender() {
    var delta = this.clock.getDelta();
    this.controls.update(delta);
  }

  loadTextures() {
    const TEXTURES_DIR = "../../textures";

    // this.textures.skyboxTexture = this.textureLoader.load(`${TEXTURES_DIR}/planets_textures/8k_stars_milky_way.jpg`);
    this.textures.skyboxTexture = this.cubeTextureLoader.load([
      `${TEXTURES_DIR}/skybox1/1.png`,
      `${TEXTURES_DIR}/skybox1/2.png`,
      `${TEXTURES_DIR}/skybox1/3.png`,
      `${TEXTURES_DIR}/skybox1/4.png`,
      `${TEXTURES_DIR}/skybox1/5.png`,
      `${TEXTURES_DIR}/skybox1/6.png`,
    ]);

    const WHITE_MARBLE_LOC = `${TEXTURES_DIR}/white_marble`;
    this.textures.whiteMarbleColorTexture = this.tgaLoader.load(`${WHITE_MARBLE_LOC}/white_marble_03_2k_baseColor.tga`);
    this.textures.whiteMarbleHeightTexture = this.tgaLoader.load(`${WHITE_MARBLE_LOC}/white_marble_03_2k_height.tga`);
    this.textures.whiteMarbleNormalTexture = this.tgaLoader.load(`${WHITE_MARBLE_LOC}/white_marble_03_2k_normal.tga`);

    this.textures.granite = this.textureLoader.load(`${TEXTURES_DIR}/marble18.jpg`);

    this.textures.cobbleStoneTexture = this.tgaLoader.load(`${TEXTURES_DIR}/cobblestone/CobbleStone_03_BC.tga`);
    this.textures.cobbleStoneDisplacementTexture = this.tgaLoader.load(`${TEXTURES_DIR}/cobblestone/CobbleStone_03_H.tga`);
    this.textures.cobbleStoneNormalTexture = this.tgaLoader.load(`${TEXTURES_DIR}/cobblestone/CobbleStone_03_N.tga`);

    this.textures.tiles1Texture = this.textureLoader.load(`${TEXTURES_DIR}/tileable_1/Brick_02.png`);
    this.textures.tiles1NormalTexture = this.textureLoader.load(`${TEXTURES_DIR}/tileable_1/Brick_02_Nrm.png`);
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
    this.controls = new OrbitControls(this.camera, this.canvas);
  }

  setupCameras() {
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

  buildSceneGraph() {
    const thisEngine = this;

    const HALL_LENGTH = 900;
    const HALL_WIDTH = 500;
    const HALL_HEIGHT = 200;

    // skybox
    this.scene.background = this.textures.skyboxTexture;
    // const SKYBOX_EMISSIVE_COLOR_LEVEL = 1;
    // const SKYBOX_SIZE = 50_000;
    // const skyboxGeometry = new THREE.BoxBufferGeometry(SKYBOX_SIZE, SKYBOX_SIZE, SKYBOX_SIZE);
    // const skyboxMaterial = new THREE.MeshStandardMaterial({
    //   map: this.textures.skyboxTexture,
    //   emissiveMap: this.textures.skyboxTexture,
    //   emissive: new THREE.Color(
    //     SKYBOX_EMISSIVE_COLOR_LEVEL,
    //     SKYBOX_EMISSIVE_COLOR_LEVEL,
    //     SKYBOX_EMISSIVE_COLOR_LEVEL,
    //   ),
    //   emissiveIntensity: 1,
    //   side: THREE.DoubleSide,
    // });
    // const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    // this.scene.add(skybox);

    function prepTextureClone(originalTexture, repeatParams) {
      let clonedTexture = originalTexture.clone();
      clonedTexture.wrapS = THREE.RepeatWrapping;
      clonedTexture.wrapT = THREE.RepeatWrapping;
      clonedTexture.magFilter = THREE.NearestFilter;
      clonedTexture.repeat.set(...repeatParams);
      clonedTexture.needsUpdate = true;
      return clonedTexture;
    }

    // floor
    const floorGeo = new THREE.PlaneBufferGeometry(HALL_LENGTH, HALL_WIDTH, 1, 1);

    let floorTextRepeatParams = [10, 8];

    let whiteMarbleFloorTexture = prepTextureClone(thisEngine.textures.whiteMarbleColorTexture, floorTextRepeatParams);
    let whiteMarbleDisplacementFloorTexture = prepTextureClone(thisEngine.textures.whiteMarbleHeightTexture, floorTextRepeatParams);
    let whiteMarbleNormalFloorTexture = prepTextureClone(thisEngine.textures.whiteMarbleNormalTexture, floorTextRepeatParams);

    const floorMaterial = new THREE.MeshPhongMaterial({
      map: whiteMarbleFloorTexture,
      shininess: 200,
      normalMap: whiteMarbleNormalFloorTexture,
    });
    const floor = new THREE.Mesh(floorGeo, floorMaterial);
    floor.rotation.x = THREE.MathUtils.degToRad(-90);
    this.scene.add(floor);

    // --- WALLS ---
    function makeWall(planeParams, textureRepeatParams, displacementScale) {
      const wallGeo = new THREE.PlaneBufferGeometry(...planeParams);

      let cobbleStoneWallTexture = prepTextureClone(thisEngine.textures.cobbleStoneTexture, textureRepeatParams);
      let cobbleStoneDisplacementWallTexture = prepTextureClone(thisEngine.textures.cobbleStoneDisplacementTexture, textureRepeatParams);
      let cobbleStoneNormalWallTexture = prepTextureClone(thisEngine.textures.cobbleStoneNormalTexture, textureRepeatParams);

      const wallMaterial = new THREE.MeshStandardMaterial({
        map: cobbleStoneWallTexture,
        displacementMap: cobbleStoneDisplacementWallTexture,
        displacementScale: displacementScale,
        normalMap: cobbleStoneNormalWallTexture,
      });
      return new THREE.Mesh(wallGeo, wallMaterial);
    }

    // wall right
    let wallRight = makeWall(
      [HALL_LENGTH, HALL_HEIGHT, 600, 200],
      [5, 3],
      0.25
    );
    wallRight.position.y += HALL_HEIGHT / 2;
    wallRight.position.z -= HALL_WIDTH / 2;
    this.scene.add(wallRight);

    // wall left
    let wallLeft = makeWall(
      [HALL_LENGTH, HALL_HEIGHT, 600, 200],
      [5, 3],
      0.25
    );
    wallLeft.rotation.y = THREE.MathUtils.degToRad(180);
    wallLeft.position.y += HALL_HEIGHT / 2;
    wallLeft.position.z += HALL_WIDTH / 2;
    this.scene.add(wallLeft);

    // ceiling
    const ceilingGeo = new THREE.PlaneBufferGeometry(HALL_LENGTH, HALL_WIDTH, 600, 200);
    let ceilingTexture = prepTextureClone(this.textures.tiles1Texture, [7, 5]);
    let ceilingNormalTexture = prepTextureClone(this.textures.tiles1NormalTexture, [7, 5]);

    const ceilingMaterial = new THREE.MeshPhongMaterial({
      map: ceilingTexture,
      normalMap: ceilingNormalTexture,
      shininess: 200,
    });
    let ceiling = new THREE.Mesh(ceilingGeo, ceilingMaterial);
    ceiling.rotation.x = THREE.MathUtils.degToRad(90);
    ceiling.position.y += HALL_HEIGHT * 0.91;
    this.scene.add(ceiling);

    // --- COLUMNS ---
    const NUMBER_OF_COLS = 14;
    const NUMBER_OF_SPACES_BTWN_COLS = NUMBER_OF_COLS + 1;
    const COL_SPACE = HALL_LENGTH / NUMBER_OF_SPACES_BTWN_COLS;
    const COL_SCALE = 0.3;

    // left columns
    for (let i = 1; i <= NUMBER_OF_COLS; ++i) {
      let columnClone = thisEngine.models.column.clone();
      columnClone.position.z += (HALL_WIDTH / 2) * 0.75;
      columnClone.position.x += -(HALL_LENGTH / 2) + COL_SPACE * i;
      columnClone.scale.copy(new THREE.Vector3(COL_SCALE, COL_SCALE, COL_SCALE));
      thisEngine.scene.add(columnClone);
    }

    for (let i = 1; i <= NUMBER_OF_COLS; ++i) {
      let columnClone = thisEngine.models.column.clone();
      columnClone.position.z += (HALL_WIDTH / 2) * 0.45;
      columnClone.position.x += -(HALL_LENGTH / 2) + COL_SPACE * i;
      columnClone.scale.copy(new THREE.Vector3(COL_SCALE, COL_SCALE, COL_SCALE));
      thisEngine.scene.add(columnClone);
    }

    // right columns
    for (let i = 1; i <= NUMBER_OF_COLS; ++i) {
      let columnClone = thisEngine.models.column.clone();
      columnClone.position.z -= (HALL_WIDTH / 2) * 0.45;
      columnClone.position.x += -(HALL_LENGTH / 2) + COL_SPACE * i;
      columnClone.scale.copy(new THREE.Vector3(COL_SCALE, COL_SCALE, COL_SCALE));
      thisEngine.scene.add(columnClone);
    }

    for (let i = 1; i <= NUMBER_OF_COLS; ++i) {
      let columnClone = thisEngine.models.column.clone();
      columnClone.position.z -= (HALL_WIDTH / 2) * 0.75;
      columnClone.position.x += -(HALL_LENGTH / 2) + COL_SPACE * i;
      columnClone.scale.copy(new THREE.Vector3(COL_SCALE, COL_SCALE, COL_SCALE));
      thisEngine.scene.add(columnClone);
    }

    // --- LIGHTS ---

    // lights
    const PLDIST = 100;

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(PLDIST, PLDIST, PLDIST);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 25, 0);

    this.scene.add(pointLight);
    this.scene.add(directionalLight);

  }  // END buildSceneGraph
}

const engine = new RenderEngine();
