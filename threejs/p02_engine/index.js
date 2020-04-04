
const ROTATION_RATE = 0.1;
const ADVANCE_RATE = 1;
const SLOW_ADVANCE_RATE = 0.1;
const LIGHT_ADVANCE_RATE = 1;

const INITIAL_CAMERA_X = 0;
const INITIAL_CAMERA_Y = 0;
const INITIAL_CAMERA_Z = 50;

// 10, 0, 25
const INITIAL_LIGHT_X = 10;
const INITIAL_LIGHT_Y = 10;
const INITIAL_LIGHT_Z = 50;

const INITIAL_BOX_ROTATION_X = 0.5;
const INITIAL_BOX_ROTATION_Y = 0.8;


class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}


class SceneState {
    constructor() {
        this.up = false;
        this.down = false;
        this.right = false;
        this.left = false;
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

        this.reset = false;
        this.auto = false;
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

        this._renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
        });
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
        this._light.position.set(INITIAL_LIGHT_X, INITIAL_LIGHT_Y, INITIAL_LIGHT_Z);
        this._camera.position.z = INITIAL_CAMERA_Z;

        // confirm scene initialization
        this._initializedScene = true;
    }

    resetScene(callback) {
        this.state.reset = true;
        let _this = this;

        // let resetScanInterval = setInterval(function() {
        //     if (_this.state.reset )
        // }, 10);
    }

    updateState() {
        if (!this._initializedScene) {
            throw Error("AnimationEngine.initializeScene was not called! It must be called before calling updateState!");
            return;
        }

        if (this.state.reset) {

            function determineValueReset(engine, value, initial, negativeStateAttributeName, positiveStateAttributeName) {
                if (value < initial) {
                    engine.state[negativeStateAttributeName] = true;
                    return false;
                } else if (value > initial) {
                    engine.state[positiveStateAttributeName] = true;
                    return false;
                } else {
                    engine.state[negativeStateAttributeName] = false;
                    engine.state[positiveStateAttributeName] = false;
                    return true;
                }
            }

            let resetStates = [];

            resetStates.push(determineValueReset(this, this._camera.position.z, INITIAL_CAMERA_Z, 'backward', 'forward'));
            resetStates.push(determineValueReset(this, this._camera.position.x, INITIAL_CAMERA_X, 'right', 'left'));
            resetStates.push(determineValueReset(this, this._camera.position.y, INITIAL_CAMERA_Y, 'up', 'down'));

            resetStates.push(determineValueReset(this, this._light.position.z, INITIAL_LIGHT_Z, 'lightBackward', 'lightForward'));
            resetStates.push(determineValueReset(this, this._light.position.x, INITIAL_LIGHT_X, 'lightRight', 'lightLeft'));
            resetStates.push(determineValueReset(this, this._light.position.y, INITIAL_LIGHT_Y, 'lightUp', 'lightDown'));

            resetStates.push(determineValueReset(this, this._entities['box1'].rotation.x, INITIAL_BOX_ROTATION_X, 'rotateUp', 'rotateDown'));
            resetStates.push(determineValueReset(this, this._entities['box1'].rotation.y, INITIAL_BOX_ROTATION_Y, 'rotateRight', 'rotateLeft'));

            if (resetStates.every((v) => {return v;})) {
                this.state.reset = false;
                this.state.auto = true;
            }
        }

        if (this.state.auto) {
            this._entities['box1'].rotation.y = Math.round((this._entities['box1'].rotation.y + SLOW_ADVANCE_RATE) * 100) / 100;

            if((this._entities['box1'].rotation.y > (INITIAL_BOX_ROTATION_Y + Math.PI)) || (this._entities['box1'].rotation.y < 0)) {
                this._entities['box1'].rotation.y = INITIAL_BOX_ROTATION_Y;
            }

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

        if (this.state.up) {
            this._camera.position.y += ADVANCE_RATE;
        }

        if (this.state.down) {
            this._camera.position.y -= ADVANCE_RATE;
        }

        if (this.state.rotateRight) {
            this._entities['box1'].rotation.y = Math.round((this._entities['box1'].rotation.y + ROTATION_RATE) * 100) / 100;
        }

        if (this.state.rotateLeft) {
            this._entities['box1'].rotation.y = Math.round((this._entities['box1'].rotation.y - ROTATION_RATE) * 100) / 100;;
        }

        if (this.state.rotateUp) {
            this._entities['box1'].rotation.x = Math.round((this._entities['box1'].rotation.x + ROTATION_RATE) * 100) / 100;
        }

        if (this.state.rotateDown) {
            this._entities['box1'].rotation.x = Math.round((this._entities['box1'].rotation.x - ROTATION_RATE) * 100) / 100;
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

    function keyToggleBind(keyCombo, stateObject, statePropertyName, callback) {

        keyboardJS.bind(keyCombo,
            function() {
                if (typeof(callback) !== "undefined")
                    callback();
                stateObject[statePropertyName] = true;
            },
            function() {
                if (typeof(callback) !== "undefined")
                    callback();
                stateObject[statePropertyName] = false;
            }
        );

    }

    function updateStats() {
        let cameraCoordinates = $("#camera-coordinates");
        cameraCoordinates.text(`${engine._camera.position.x} ${engine._camera.position.y} ${engine._camera.position.z}`);

        let lightCoordinates = $("#light-coordinates");
        lightCoordinates.text(`${engine._light.position.x} ${engine._light.position.y} ${engine._light.position.z}`);

        let cubeRotation = $("#cube-rotation");
        cubeRotation.text(`${Math.round(engine._entities['box1'].rotation.x * 100) / 100} ${Math.round(engine._entities['box1'].rotation.y * 100) / 100}`);
    }

    function cancelAutoAnimate() {

        if (!engine.state.reset & !engine.state.auto)
            return;

        engine.state.upActive = false;
        engine.state.downActive = false;
        engine.state.right = false;
        engine.state.left = false;
        engine.state.forward = false;
        engine.state.backward = false;

        engine.state.rotateRight = false;
        engine.state.rotateLeft = false;
        engine.state.rotateUp = false;
        engine.state.rotateDown = false;

        engine.state.lightUp = false;
        engine.state.lightDown = false;

        engine.state.lightLeft = false;
        engine.state.lightRight = false;

        engine.state.lightForward = false;
        engine.state.lightBackward = false;

        engine.state.reset = false;
        engine.state.auto = false;
    }

    keyToggleBind('w', engine.state, 'forward', cancelAutoAnimate);
    keyToggleBind('s', engine.state, 'backward', cancelAutoAnimate);
    keyToggleBind('a', engine.state, 'left', cancelAutoAnimate);
    keyToggleBind('d', engine.state, 'right', cancelAutoAnimate);

    keyToggleBind('space', engine.state, 'up', cancelAutoAnimate);
    keyToggleBind('c', engine.state, 'down', cancelAutoAnimate);

    keyToggleBind('right', engine.state, 'rotateRight', cancelAutoAnimate);
    keyToggleBind('left', engine.state, 'rotateLeft', cancelAutoAnimate);

    keyToggleBind('up', engine.state, 'rotateUp', cancelAutoAnimate);
    keyToggleBind('down', engine.state, 'rotateDown', cancelAutoAnimate);

    keyToggleBind('numseven', engine.state, 'lightUp', cancelAutoAnimate);
    keyToggleBind('numnine', engine.state, 'lightDown', cancelAutoAnimate);
    keyToggleBind('numfour', engine.state, 'lightLeft', cancelAutoAnimate);
    keyToggleBind('numsix', engine.state, 'lightRight', cancelAutoAnimate);
    keyToggleBind('numeight', engine.state, 'lightForward', cancelAutoAnimate);
    keyToggleBind('numtwo', engine.state, 'lightBackward', cancelAutoAnimate);

    function resetAndAutoAnimate() {
        if (engine.state.reset | engine.state.auto) {
            cancelAutoAnimate();
            return;
        };

        engine.resetScene(function(){
            engine.state.auto = true;
        });

    }

    keyboardJS.bind('r', resetAndAutoAnimate);
    resetAndAutoAnimate();
});
