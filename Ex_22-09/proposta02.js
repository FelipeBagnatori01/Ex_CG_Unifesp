// Vertex shader source code
const vertexShaderSource = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0, 1);
    gl_PointSize = 5.0;
  }
`;

// Fragment shader source code
const fragmentShaderSource = `
  precision mediump float;
  uniform vec3 u_color;

  void main() {
    gl_FragColor = vec4(u_color,1.0);
  }
`;

function createShader1(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
  }
  
  return shader;
}

function createProgram1(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error linking program:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
  }
  
  return program;
}


function main(){
  const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShader1(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader1(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    const program = createProgram1(gl, vertexShader, fragmentShader);
    
    gl.useProgram(program);

    const vertex = new Float32Array([
         0.0,  0.0
    ]);

    const VertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertex, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    let colorVector = [0.0,0.0,1.0];
    let centerPoint = {x: 0.0, y: 0.0};
    let circlePoints = [0.0, 0.0];
    let inputMode = 'color';
    let circleRadius = 50;

    const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
    gl.uniform3fv(colorUniformLocation,colorVector);

    canvas.addEventListener("mousedown",mouseClick,false);
  
    function mouseClick(event){
      let x = (2/canvas.width * event.offsetX) - 1;
      let y = (-2/canvas.height * event.offsetY) + 1;
      
      centerPoint = {x: x, y: y};
      circlePoints = bresenhamCircle(x, y, circleRadius);
      
      updateBuffer();
      drawCircle();
    }
  
    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown",keyDown,false);
  
    function keyDown(event){
      if (inputMode === 'color') {
        switch(event.key){
          case '0':
            colorVector = [Math.random(),Math.random(),Math.random()];
            break;
          case '1':
            colorVector = [1.0,0.0,0.0];
            break;
          case '2':
            colorVector = [0.0,1.0,0.0];
            break;
          case '3':
            colorVector = [0.0,0.0,1.0];
            break;
          case '4':
            colorVector = [0.0,1.0,1.0];
            break;
          case '5':
            colorVector = [1.0,1.0,0.0];
            break;
          case '6':
            colorVector = [1.0,0.5,0.0];
            break;
          case '7':
            colorVector = [0.0,1.0,0.5];
            break;
          case '8':
            colorVector = [0.2,0.5,0.3];
            break;
          case '9':
            colorVector = [0.5,0.0,1.0];
            break;
        }
        gl.uniform3fv(colorUniformLocation,colorVector);
      } else if (inputMode === 'radius') {
        switch(event.key){
          case '0':
            circleRadius = 10;
            break;
          case '1':
            circleRadius = 20;
            break;
          case '2':
            circleRadius = 30;
            break;
          case '3':
            circleRadius = 40;
            break;
          case '4':
            circleRadius = 50;
            break;
          case '5':
            circleRadius = 60;
            break;
          case '6':
            circleRadius = 70;
            break;
          case '7':
            circleRadius = 80;
            break;
          case '8':
            circleRadius = 90;
            break;
          case '9':
            circleRadius = 100;
            break;
        }
      }
      
      switch(event.key){
        case 'e':
          inputMode = 'radius';
          break;
        case 'k':
          inputMode = 'color';
          break;
      }
      drawCircle();
    }

    function bresenhamCircle(centerX, centerY, radius) {
      const points = [];
      const pixelSize = 2 / canvas.width;
      
      let x = 0;
      let y = radius;
      let d = 3 - 2 * radius;
      
      while (y >= x) {
        points.push(centerX + x * pixelSize, centerY + y * pixelSize);
        points.push(centerX - x * pixelSize, centerY + y * pixelSize);
        points.push(centerX + x * pixelSize, centerY - y * pixelSize);
        points.push(centerX - x * pixelSize, centerY - y * pixelSize);
        points.push(centerX + y * pixelSize, centerY + x * pixelSize);
        points.push(centerX - y * pixelSize, centerY + x * pixelSize);
        points.push(centerX + y * pixelSize, centerY - x * pixelSize);
        points.push(centerX - y * pixelSize, centerY - x * pixelSize);
        
        x++;
        if (d > 0) {
          y--;
          d = d + 4 * (x - y) + 10;
        } else {
          d = d + 4 * x + 6;
        }
      }
      
      return points;
    }
    
    function updateBuffer() {
      gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circlePoints), gl.STATIC_DRAW);
    }

    function drawCircle(){
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, circlePoints.length / 2);
    }

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawCircle();
}

main();