
import * as THREE from '../vendor/three.module.js';


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

        // TODO: what?
        // let resetScanInterval = setInterval(function() {
        //     if (_this.state.reset )
        // }, 10);
    }

    updateState() {
        if (!this._initializedScene) {
            throw new Error("AnimationEngine.initializeScene was not called! It must be called before calling updateState!");
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



export {}
