(function() {
    let canvas = document.getElementById("scene");

    let gl = canvas.getContext("webgl");

    // check if webgl available
    if (!gl) {
        throw Error("No WebGL available!");
        return;
    }

    // function that handles the shader creation boilerplate
    function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    const vertexShaderSource = `
        // an attribute will receive data from a buffer
        attribute vec4 a_position;

        // all shaders have a main function
        void main() {

            // gl_Position is a special variable a vertex shader
            // is responsible for setting
            gl_Position = a_position;
        }
    `;

    const fragmentShaderSource = `
        // fragment shaders don't have a default precision so we need
        // to pick one. mediump is a good default
        precision mediump float;

        void main() {
            // gl_FragColor is a special variable a fragment shader
            // is responsible for setting
            gl_FragColor = vec4(1, 0, 0.5, 1); // return redish-purple
        }
    `;

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // handle boilerplate program creation (vertex + fragment shaders)
    function createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
        return program;
        }

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    // make the program
    var program = createProgram(gl, vertexShader, fragmentShader);
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");


    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // three 2d points
    var positions = [
        0, 0,
        0, 0.5,
        0.8, 0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // * RENDERING *

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell WebGL to use our program (pair of shaders)
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset)

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 3;
    gl.drawArrays(primitiveType, offset, count);
})();
