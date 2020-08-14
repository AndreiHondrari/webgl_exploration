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

    const ARROW_LENGTH = 500;
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
    // this.scene.add(this.axesGroup);

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
    const XZ = 20;
    this.camera.position.x = -XZ;
    this.camera.position.y = 20;
    this.camera.position.z = XZ;
    // this.camera.zoom = 5;
    this.camera.updateProjectionMatrix();

    // controls
    this.controls = this.selectControls(CONTROLS.ORBIT);
    this.controls.zoom0 = 10;
    this.controls.saveState();
    this.controls.update();

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
    this.rotateObjects();

    let targetPosition = new THREE.Vector3();
    this.objects.earth.getWorldPosition(targetPosition);
    this.controls.target.copy(targetPosition);
    this.controls.update();

  	this.render();
  }

  rotateObject(planet, angularSpeed, reverse) {

    if (reverse === undefined)
      reverse = false;

    if (reverse)
      planet.rotation.y -= angularSpeed;
    else
      planet.rotation.y += angularSpeed;
  }

  rotateObjects() {
    const self = this;

    /*
    Mercury 1.607
    Venus 1.174
    Earth 1.000
    Mars 0.802
    Jupiter 0.434
    Saturn 0.323
    Uranus 0.228
    Neptune	0.182
    Pluto 0.159
    */

    const FULL_RAD_CIRCUMFERENCE = Math.PI * 2;

    const EARTH_ROTATION_SPEED = FULL_RAD_CIRCUMFERENCE * 0.0001;
    const EARTH_ORBIT_SPEED = FULL_RAD_CIRCUMFERENCE * 0.00001;

    // this.objects.earth.rotation.y += 0.1;
    const originVector = new THREE.Vector3(0, 1, 0);

    // orbital rotations
    this.rotateObject(this.objects.sun, FULL_RAD_CIRCUMFERENCE * 0.0001);
    this.rotateObject(this.objects.mercuryOrbit, EARTH_ORBIT_SPEED * 1.607);
    this.rotateObject(this.objects.venusOrbit, EARTH_ORBIT_SPEED * 1.174);
    this.rotateObject(this.objects.earthSystemOrbit, EARTH_ORBIT_SPEED);
    this.rotateObject(this.objects.moonOrbit, FULL_RAD_CIRCUMFERENCE * 0.0008, true);
    this.rotateObject(this.objects.marsOrbit, EARTH_ORBIT_SPEED * 0.802);
    this.rotateObject(this.objects.jupiterOrbit, EARTH_ORBIT_SPEED * 0.434);
    this.rotateObject(this.objects.saturnOrbit, EARTH_ORBIT_SPEED * 0.323);
    this.rotateObject(this.objects.uranusOrbit, EARTH_ORBIT_SPEED * 0.228);
    this.rotateObject(this.objects.neptuneOrbit, EARTH_ORBIT_SPEED * 0.182);
    this.rotateObject(this.objects.plutoOrbit, EARTH_ORBIT_SPEED * 0.159);

    // planetary rotations
    this.rotateObject(this.objects.mercury, EARTH_ROTATION_SPEED, true);
    this.rotateObject(this.objects.venus, EARTH_ROTATION_SPEED * 1.174);
    this.rotateObject(this.objects.earth, EARTH_ROTATION_SPEED);
    this.rotateObject(this.objects.moon, FULL_RAD_CIRCUMFERENCE * 0.01);
    this.rotateObject(this.objects.mars, EARTH_ROTATION_SPEED * 0.802);
    this.rotateObject(this.objects.jupiter, EARTH_ROTATION_SPEED * 0.434);
    this.rotateObject(this.objects.saturn, EARTH_ROTATION_SPEED * 0.323);
    this.rotateObject(this.objects.uranus, EARTH_ROTATION_SPEED * 0.228);
    this.rotateObject(this.objects.neptune, EARTH_ROTATION_SPEED * 0.182);
    this.rotateObject(this.objects.pluto, EARTH_ROTATION_SPEED * 0.159);

    // other rotations
    this.rotateObject(this.objects.earthClouds, -EARTH_ROTATION_SPEED);
  }

  buildSceneGraph() {
    /*
    Jupiter (69,911 km) – 1,120% the size of Earth
    Saturn (58,232 km) – 945% the size of Earth
    Uranus (25,362 km) – 400% the size of Earth
    Neptune (24,622 km) – 388% the size of Earth
    Earth (6,371 km)
    Venus (6,052 km) – 95% the size of Earth
    Mars (3,390 km) – 53% the size of Earth
    Mercury (2,440 km) – 38% the size of Earth
    */
    const SPHERE_DETAIL = 100;

    const loader = new THREE.TextureLoader();
    const skyboxTexture = loader.load('planets_textures/8k_stars_milky_way.jpg')
    const sunTexture = loader.load('planets_textures/2k_sun.jpg');
    const mercuryTexture = loader.load('planets_textures/2k_mercury.jpg');
    const venusTexture = loader.load('planets_textures/2k_venus_surface.jpg');
    const earthTexture = loader.load('planets_textures/8k_earth_daymap.jpg');
    const earthNormalTexture = loader.load('planets_textures/8k_earth_normal_map.tif');
    const earthSpecularTexture = loader.load('planets_textures/8k_earth_specular_map.tif');
    const moonTexture = loader.load('planets_textures/2k_moon.jpg');
    const marsTexture = loader.load('planets_textures/2k_mars.jpg');
    const jupiterTexture = loader.load('planets_textures/2k_jupiter.jpg');
    const saturnTexture = loader.load('planets_textures/2k_saturn.jpg');
    const saturnRingTexture = loader.load('planets_textures/2k_saturn_ring_alpha.png');
    const uranusTexture = loader.load('planets_textures/2k_uranus.jpg');
    const neptuneTexture = loader.load('planets_textures/2k_neptune.jpg');
    const plutoTexture = loader.load('planets_textures/plutomap2k.jpg');
    const earthCloudsTexture = loader.load('planets_textures/8k_earth_clouds.jpg');

    // add light
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(0, 0, 0);

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

    // solar system
    const solarSystem = new THREE.Object3D();
    solarSystem.add(pointLight);
    this.objects.solarSystem = solarSystem;

    function createPlanet(radius, planetTexture) {
      const planetGeometry = new THREE.SphereGeometry(radius, SPHERE_DETAIL, SPHERE_DETAIL);
      const planetMaterial = new THREE.MeshStandardMaterial({
        map: planetTexture,
      });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);
      planet.rotation.y = Math.random() * Math.PI * 2;
      return planet;
    };

    function createPlanetInOrbit(radius, planetTexture) {
      const planetOrbit = new THREE.Object3D();
      const planet = createPlanet(radius, planetTexture);
      planetOrbit.add(planet);
      return [planet, planetOrbit];
    };

    // sun
    const sun = createPlanet(100, sunTexture);
    sun.material.emissiveMap = sunTexture;
    sun.material.emissive = new THREE.Color(10, 10, 0);
    sun.material.emissiveIntensity = 0.1;
    solarSystem.add(sun);
    this.objects.sun = sun;

    // mercury
    let mercury, mercuryOrbit;
    [mercury, mercuryOrbit] = createPlanetInOrbit(10, mercuryTexture);
    mercury.position.x = 180;
    mercuryOrbit.rotation.y = Math.random() * Math.PI * 2;

    solarSystem.add(mercuryOrbit);
    this.objects.mercury = mercury;
    this.objects.mercuryOrbit = mercuryOrbit;

    // venus
    let venus, venusOrbit;
    [venus, venusOrbit] = createPlanetInOrbit(10, venusTexture);
    venus.position.x = 270;
    venusOrbit.rotation.y = Math.random() * Math.PI * 2;

    solarSystem.add(venusOrbit);
    this.objects.venus = venus;
    this.objects.venusOrbit = venusOrbit;

    // earth system
    let earthSystem = new THREE.Object3D();
    let earthSystemOrbit = new THREE.Object3D();
    earthSystem.position.x = 370;
    earthSystemOrbit.rotation.y = Math.random() * Math.PI * 2;
    earthSystemOrbit.add(earthSystem);
    solarSystem.add(earthSystemOrbit);

    this.objects.earthSystem = earthSystem;
    this.objects.earthSystemOrbit = earthSystemOrbit;

    let earth, earthOrbit;
    [earth, earthOrbit] = createPlanetInOrbit(20, earthTexture);
    earth.material.bumpMap = earthSpecularTexture;
    earth.material.displacementMap = earthSpecularTexture;
    // earth.material.normalMap = earthNormalTexture;

    earthSystem.add(earthOrbit);

    this.objects.earth = earth;
    this.objects.earthOrbit = earthOrbit;

    // earth clouds
    let earthCloudsGeo = new THREE.SphereGeometry(21, 50, 50);
    let earthCloudsMaterial = new THREE.MeshStandardMaterial({
      map: earthCloudsTexture,
      alphaMap: earthCloudsTexture,
      transparent: true,
    });
    let earthClouds = new THREE.Mesh(earthCloudsGeo, earthCloudsMaterial);

    earthSystem.add(earthClouds);

    this.objects.earthClouds = earthClouds;

    // moon
    let moon, moonOrbit;
    [moon, moonOrbit] = createPlanetInOrbit(5, moonTexture);
    moon.position.x = 50;

    earthSystem.add(moonOrbit);

    this.objects.moon = moon;
    this.objects.moonOrbit = moonOrbit;

    // mars
    let mars, marsOrbit;
    [mars, marsOrbit] = createPlanetInOrbit(10, marsTexture);
    mars.position.x = 500;
    marsOrbit.rotation.y = Math.random() * Math.PI * 2;

    solarSystem.add(marsOrbit);
    this.objects.mars = mars;
    this.objects.marsOrbit = marsOrbit;

    // jupiter
    let jupiter, jupiterOrbit;
    [jupiter, jupiterOrbit] = createPlanetInOrbit(70, jupiterTexture);
    jupiter.position.x = 750;
    jupiterOrbit.rotation.y = Math.random() * Math.PI * 2;

    solarSystem.add(jupiterOrbit);
    this.objects.jupiter = jupiter;
    this.objects.jupiterOrbit = jupiterOrbit;

    // saturn
    let saturn, saturnOrbit;
    [saturn, saturnOrbit] = createPlanetInOrbit(65, saturnTexture);
    saturn.position.x = 1000;
    saturnOrbit.rotation.y = Math.random() * Math.PI * 2;

    solarSystem.add(saturnOrbit);
    this.objects.saturn = saturn;
    this.objects.saturnOrbit = saturnOrbit;

    // uranus
    let uranus, uranusOrbit;
    [uranus, uranusOrbit] = createPlanetInOrbit(45, uranusTexture);
    uranus.position.x = 1250;
    uranusOrbit.rotation.y = Math.random() * Math.PI * 2;

    solarSystem.add(uranusOrbit);
    this.objects.uranus = uranus;
    this.objects.uranusOrbit = uranusOrbit;

    // neptune
    let neptune, neptuneOrbit;
    [neptune, neptuneOrbit] = createPlanetInOrbit(45, neptuneTexture);
    neptune.position.x = 1450;
    neptuneOrbit.rotation.y = Math.random() * Math.PI * 2;

    solarSystem.add(neptuneOrbit);
    this.objects.neptune = neptune;
    this.objects.neptuneOrbit = neptuneOrbit;

    // pluto
    let pluto, plutoOrbit;
    [pluto, plutoOrbit] = createPlanetInOrbit(6.5, plutoTexture);
    pluto.position.x = 1600;
    plutoOrbit.rotation.y = Math.random() * Math.PI * 2;

    solarSystem.add(plutoOrbit);
    this.objects.pluto = pluto;
    this.objects.plutoOrbit = plutoOrbit;

    // add nodes to scene
    this.scene.add(skybox);
    this.scene.add(solarSystem);
  }
}

const engine = new RenderEngine();
engine.animate();
