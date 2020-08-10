
const ROTATION_RATE = 0.1;
const ADVANCE_RATE = 1;
const SLOW_ADVANCE_RATE = 0.01;
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

    keyToggleBind('7', engine.state, 'lightUp', cancelAutoAnimate);
    keyToggleBind('9', engine.state, 'lightDown', cancelAutoAnimate);
    keyToggleBind('4', engine.state, 'lightLeft', cancelAutoAnimate);
    keyToggleBind('6', engine.state, 'lightRight', cancelAutoAnimate);
    keyToggleBind('8', engine.state, 'lightForward', cancelAutoAnimate);
    keyToggleBind('2', engine.state, 'lightBackward', cancelAutoAnimate);

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
