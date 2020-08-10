$(function(){
    var jqCanvas = $("#canvas");
    var canvas = jqCanvas[0];
    var jqWrapper = $("#canvas-wrapper");

    // add a scene (where we add our objects)
    var scene = new THREE.Scene();

    var width = jqWrapper.innerWidth();
    var height = jqWrapper.innerHeight();
    console.log("CANVAS SIZE", width, height);

    // add a camera
    // THREE.PerspectiveCamera(fov, aspect, near, far)
    var camera = new THREE.PerspectiveCamera(
      75,
      width/height,
      0.1,
      1000
    );

    // place the camera at z of 100
    camera.position.z = 100;

    // add a renderer
    var renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(width, height);

    // create a box
    const box1geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
    var box1 = new THREE.Mesh(box1geometry, material);

    // add box to scene
    scene.add(box1);

    // Finally render
    renderer.render(scene, camera);
});
