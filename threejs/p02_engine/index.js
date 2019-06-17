
const ROTATION_RATE = 0.1;
const ADVANCE_RATE = 1;
const LIGHT_ADVANCE_RATE = 1;


class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}


class SceneState {
    constructor() {
        this.upActive = false;
        this.downActive = false;
        this.rightActive = false;
        this.leftActive = false;
        this.forward = false;
        this.backward = false;

        this.rotateRight = false;
        this.rotateLeft = false;
        this.rotateUp = false;
        this.rotateDown = false;

        this.lightUp = false;
        this.lightDown = false;

        this.lightLeft = false;
        this.lightRight = false;

        this.lightForward = false;
        this.lightBackward = false;
    }
}

class AnimationEngine {
    constructor(canvas, size) {
        this._scene = new THREE.Scene();
        this._size = size;

        // THREE.PerspectiveCamera(fov, aspect, near, far)
        this._camera = new THREE.PerspectiveCamera(
            75,
            size.width/size.height,
            // 2,
            0.1,
            1000
            // 5,
        );
        this._light = new THREE.PointLight(0xFFFF00);
        this._scene.add(this._light);

        this._renderer = new THREE.WebGLRenderer({canvas});
        this._renderer.setSize(size.width, size.height);
        this.state = new SceneState();
        this._entities = {};  // scene entities

        this._initializedScene = false;
    }

    initializeScene() {
        // create a box
        const box1geometry = new THREE.BoxGeometry(20, 20, 20);
        const material = new THREE.MeshLambertMaterial({color: 0xfd59d7});
        var box1 = new THREE.Mesh(box1geometry, material);

        this._scene.add(box1);
        this._entities['box1'] = box1;

        /* position the light so it shines on the cube (x, y, z) */
        this._light.position.set(10, 0, 25);
        this._camera.position.z = 50;

        // confirm scene initialization
        this._initializedScene = true;
    }

    updateState() {
        if (!this._initializedScene) {
            throw Error("AnimationEngine.initializeScene was not called! It must be called before calling updateState!");
            return;
        }

        if (this.state.forward) {
            this._camera.position.z -= ADVANCE_RATE;
        }

        if (this.state.backward) {
            this._camera.position.z += ADVANCE_RATE;
        }

        if (this.state.right) {
            this._camera.position.x += ADVANCE_RATE;
        }

        if (this.state.left) {
            this._camera.position.x -= ADVANCE_RATE;
        }

        if (this.state.upActive) {
            this._camera.position.y += ADVANCE_RATE;
        }

        if (this.state.downActive) {
            this._camera.position.y -= ADVANCE_RATE;
        }

        if (this.state.rotateRight) {
            this._entities['box1'].rotation.y += ROTATION_RATE;
        }

        if (this.state.rotateLeft) {
            this._entities['box1'].rotation.y -= ROTATION_RATE;
        }

        if (this.state.rotateUp) {
            this._entities['box1'].rotation.x += ROTATION_RATE;
        }

        if (this.state.rotateDown) {
            this._entities['box1'].rotation.x -= ROTATION_RATE;
        }

        if (this.state.lightUp) {
            this._light.position.y += LIGHT_ADVANCE_RATE;
        }

        if (this.state.lightDown) {
            this._light.position.y -= LIGHT_ADVANCE_RATE;
        }

        if (this.state.lightLeft) {
            this._light.position.x -= LIGHT_ADVANCE_RATE;
        }

        if (this.state.lightRight) {
            this._light.position.x += LIGHT_ADVANCE_RATE;
        }

        if (this.state.lightForward) {
            this._light.position.z -= LIGHT_ADVANCE_RATE;
        }

        if (this.state.lightBackward) {
            this._light.position.z += LIGHT_ADVANCE_RATE;
        }

        this._camera.updateProjectionMatrix();
    }

    draw() {
        this._renderer.render(this._scene, this._camera);
    }

}


$(function(){
    // canvas
    var jqCanvas = $("#canvas");
    var canvas = jqCanvas[0];
    var jqWrapper = $("#canvas-wrapper");

    // engine
    let engine = new AnimationEngine(
        canvas,
        new Size(jqWrapper.innerWidth(), jqWrapper.innerHeight())
    );

    engine.initializeScene();

    function animate() {
        requestAnimationFrame(animate);
        engine.updateState();
        engine.draw();
        updateStats();
    };

    animate();

    function keyToggleBind(keyCombo, stateObject, statePropertyName) {

        keyboardJS.bind(keyCombo,
            function() {
                stateObject[statePropertyName] = true;
            },
            function() {
                stateObject[statePropertyName] = false;
            }
        );

    }

    function updateStats() {
        let cameraCoordinates = $("#camera-coordinates");
        cameraCoordinates.text(`${engine._camera.position.x} ${engine._camera.position.y} ${engine._camera.position.z}`);

        let lightCoordinates = $("#light-coordinates");
        lightCoordinates.text(`${engine._light.position.x} ${engine._light.position.y} ${engine._light.position.z}`);
    }

    keyToggleBind('w', engine.state, 'forward');
    keyToggleBind('s', engine.state, 'backward');
    keyToggleBind('a', engine.state, 'left');
    keyToggleBind('d', engine.state, 'right');

    keyToggleBind('space', engine.state, 'upActive');
    keyToggleBind('c', engine.state, 'downActive');

    keyToggleBind('right', engine.state, 'rotateRight');
    keyToggleBind('left', engine.state, 'rotateLeft');

    keyToggleBind('up', engine.state, 'rotateUp');
    keyToggleBind('down', engine.state, 'rotateDown');

    keyToggleBind('numseven', engine.state, 'lightUp');
    keyToggleBind('numnine', engine.state, 'lightDown');
    keyToggleBind('numfour', engine.state, 'lightLeft');
    keyToggleBind('numsix', engine.state, 'lightRight');
    keyToggleBind('numeight', engine.state, 'lightForward');
    keyToggleBind('numtwo', engine.state, 'lightBackward');
});
