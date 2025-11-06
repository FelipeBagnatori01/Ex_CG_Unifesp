const canvas = document.getElementById('glCanvas');
        const gl = canvas.getContext('webgl');

        if (!gl) {
            alert('WebGL not supported');
        }

        // Camera state
        let cameraPos = { x: 0, y: 1, z: 6 };
        let cameraRot = { yaw: 0, pitch: 0 };

        // Input handling
        const keys = {};
        const moveSpeed = 0.1;
        const rotSpeed = 0.05;

        window.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;
            if (e.key.startsWith('Arrow')) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });

        function updateCamera() {
            let moved = false;
            let rotated = false;

            // Update rotation
            if (keys['arrowleft']) { cameraRot.yaw -= rotSpeed; rotated = true; }
            if (keys['arrowright']) { cameraRot.yaw += rotSpeed; rotated = true; }
            if (keys['arrowup']) { cameraRot.pitch += rotSpeed; rotated = true; }
            if (keys['arrowdown']) { cameraRot.pitch -= rotSpeed; rotated = true; }

            // Clamp pitch
            cameraRot.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, cameraRot.pitch));

            // Calculate forward and right vectors
            const forward = { x: Math.sin(cameraRot.yaw), z: Math.cos(cameraRot.yaw) };
            const right = { x: Math.cos(cameraRot.yaw), z: -Math.sin(cameraRot.yaw) };

            // Update position
            if (keys['w']) { 
                cameraPos.x += forward.x * moveSpeed; 
                cameraPos.z += forward.z * moveSpeed; 
                moved = true; 
            }
            if (keys['s']) { 
                cameraPos.x -= forward.x * moveSpeed; 
                cameraPos.z -= forward.z * moveSpeed; 
                moved = true; 
            }
            if (keys['a']) { 
                cameraPos.x -= right.x * moveSpeed; 
                cameraPos.z -= right.z * moveSpeed; 
                moved = true; 
            }
            if (keys['d']) { 
                cameraPos.x += right.x * moveSpeed; 
                cameraPos.z += right.z * moveSpeed; 
                moved = true; 
            }
            if (keys['q']) { cameraPos.y += moveSpeed; moved = true; }
            if (keys['e']) { cameraPos.y -= moveSpeed; moved = true; }
        }

        // Vertex shader
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying lowp vec4 vColor;

            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;

        // Fragment shader
        const fsSource = `
            varying lowp vec4 vColor;

            void main(void) {
                gl_FragColor = vColor;
            }
        `;

        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(shaderProgram));
        }

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
        };

        // Floor geometry
        const floorPositions = [
            -2.0, 0.0, -2.0,
             2.0, 0.0, -2.0,
             2.0, 0.0,  2.0,
            -2.0, 0.0,  2.0,
        ];

        const floorColors = [
            0.5, 0.5, 0.5, 1.0,
            0.6, 0.6, 0.6, 1.0,
            0.7, 0.7, 0.7, 1.0,
            0.5, 0.5, 0.5, 1.0,
        ];

        const floorIndices = [0, 1, 2, 0, 2, 3];

        // Cube geometry
        const cubePositions = [
            // Front face
            -0.5, 0.0, 0.5,   0.5, 0.0, 0.5,   0.5, 1.0, 0.5,  -0.5, 1.0, 0.5,
            // Back face
            -0.5, 0.0, -0.5,  -0.5, 1.0, -0.5,  0.5, 1.0, -0.5,  0.5, 0.0, -0.5,
            // Top face
            -0.5, 1.0, -0.5,  -0.5, 1.0, 0.5,   0.5, 1.0, 0.5,   0.5, 1.0, -0.5,
            // Bottom face
            -0.5, 0.0, -0.5,   0.5, 0.0, -0.5,  0.5, 0.0, 0.5,  -0.5, 0.0, 0.5,
            // Right face
            0.5, 0.0, -0.5,   0.5, 1.0, -0.5,   0.5, 1.0, 0.5,   0.5, 0.0, 0.5,
            // Left face
            -0.5, 0.0, -0.5,  -0.5, 0.0, 0.5,  -0.5, 1.0, 0.5,  -0.5, 1.0, -0.5,
        ];

        const cubeColors = [
            1.0, 0.3, 0.3, 1.0,  1.0, 0.3, 0.3, 1.0,  1.0, 0.3, 0.3, 1.0,  1.0, 0.3, 0.3, 1.0,
            0.3, 1.0, 0.3, 1.0,  0.3, 1.0, 0.3, 1.0,  0.3, 1.0, 0.3, 1.0,  0.3, 1.0, 0.3, 1.0,
            0.3, 0.3, 1.0, 1.0,  0.3, 0.3, 1.0, 1.0,  0.3, 0.3, 1.0, 1.0,  0.3, 0.3, 1.0, 1.0,
            1.0, 1.0, 0.3, 1.0,  1.0, 1.0, 0.3, 1.0,  1.0, 1.0, 0.3, 1.0,  1.0, 1.0, 0.3, 1.0,
            1.0, 0.3, 1.0, 1.0,  1.0, 0.3, 1.0, 1.0,  1.0, 0.3, 1.0, 1.0,  1.0, 0.3, 1.0, 1.0,
            0.3, 1.0, 1.0, 1.0,  0.3, 1.0, 1.0, 1.0,  0.3, 1.0, 1.0, 1.0,  0.3, 1.0, 1.0, 1.0,
        ];

        const cubeIndices = [
            0,  1,  2,    0,  2,  3,
            4,  5,  6,    4,  6,  7,
            8,  9,  10,   8,  10, 11,
            12, 13, 14,   12, 14, 15,
            16, 17, 18,   16, 18, 19,
            20, 21, 22,   20, 22, 23
        ];

        // Create buffers
        const floorPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, floorPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorPositions), gl.STATIC_DRAW);

        const floorColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, floorColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorColors), gl.STATIC_DRAW);

        const floorIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorIndices), gl.STATIC_DRAW);

        const cubePositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubePositions), gl.STATIC_DRAW);

        const cubeColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeColors), gl.STATIC_DRAW);

        const cubeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

        const buffers = {
            floor: {
                position: floorPositionBuffer,
                color: floorColorBuffer,
                indices: floorIndexBuffer,
            },
            cube: {
                position: cubePositionBuffer,
                color: cubeColorBuffer,
                indices: cubeIndexBuffer,
            },
        };

        // Matrix functions
        function mat4Identity() {
            return new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        }

        function mat4Perspective(fov, aspect, near, far) {
            const f = 1.0 / Math.tan(fov / 2);
            const nf = 1 / (near - far);
            return new Float32Array([
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, 2 * far * near * nf, 0
            ]);
        }

        function mat4Translate(mat, vec) {
            const x = vec[0], y = vec[1], z = vec[2];
            mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
            mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
            mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
            mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
        }

        function mat4RotateX(mat, angle) {
            const s = Math.sin(angle);
            const c = Math.cos(angle);
            const a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
            const a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
            mat[4] = a10 * c + a20 * s;
            mat[5] = a11 * c + a21 * s;
            mat[6] = a12 * c + a22 * s;
            mat[7] = a13 * c + a23 * s;
            mat[8] = a20 * c - a10 * s;
            mat[9] = a21 * c - a11 * s;
            mat[10] = a22 * c - a12 * s;
            mat[11] = a23 * c - a13 * s;
        }

        function mat4RotateY(mat, angle) {
            const s = Math.sin(angle);
            const c = Math.cos(angle);
            const a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
            const a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
            mat[0] = a00 * c + a20 * s;
            mat[1] = a01 * c + a21 * s;
            mat[2] = a02 * c + a22 * s;
            mat[3] = a03 * c + a23 * s;
            mat[8] = a20 * c - a00 * s;
            mat[9] = a21 * c - a01 * s;
            mat[10] = a22 * c - a02 * s;
            mat[11] = a23 * c - a03 * s;
        }

        // Render loop
        function drawScene() {
            gl.clearColor(0.1, 0.1, 0.15, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            const fieldOfView = 45 * Math.PI / 180;
            const aspect = canvas.clientWidth / canvas.clientHeight;
            const zNear = 0.1;
            const zFar = 100.0;
            const projectionMatrix = mat4Perspective(fieldOfView, aspect, zNear, zFar);

            const modelViewMatrix = mat4Identity();
            mat4Translate(modelViewMatrix, [-cameraPos.x, -cameraPos.y, -cameraPos.z]);
            mat4RotateX(modelViewMatrix, -cameraRot.pitch);
            mat4RotateY(modelViewMatrix, -cameraRot.yaw);

            gl.useProgram(programInfo.program);
            gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

            // Draw floor
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.floor.position);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.floor.color);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.floor.indices);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

            // Draw cube
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.cube.position);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.cube.color);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.cube.indices);
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

            updateCamera();
            requestAnimationFrame(drawScene);
        }

        drawScene();