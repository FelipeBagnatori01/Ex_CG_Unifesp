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
    let lastPoint = {x: 0.0, y: 0.0};
    let linePoints = [0.0, 0.0];
    let drawMode = 'line';
    let clickHistory = [{x: 0.0, y: 0.0}];
    let inputMode = 'color';
    let lineThickness = 1;

    const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
    gl.uniform3fv(colorUniformLocation,colorVector);

    canvas.addEventListener("mousedown",mouseClick,false);
  
    function mouseClick(event){
      let x = (2/canvas.width * event.offsetX) - 1;
      let y = (-2/canvas.height * event.offsetY) + 1;
      
      clickHistory.push({x: x, y: y});
      if (clickHistory.length > 3) clickHistory.shift();
      
      if (drawMode === 'line') {
        linePoints = bresenham(lastPoint.x, lastPoint.y, x, y);
        lastPoint = {x: x, y: y};
      } else if (drawMode === 'triangle' && clickHistory.length === 3) {
        linePoints = drawTriangle(clickHistory[0], clickHistory[1], clickHistory[2]);
      }
      
      updateBuffer();
      drawLine();
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
      } else if (inputMode === 'thickness') {
        switch(event.key){
          case '0':
            lineThickness = 1;
            break;
          case '1':
            lineThickness = 2;
            break;
          case '2':
            lineThickness = 3;
            break;
          case '3':
            lineThickness = 4;
            break;
          case '4':
            lineThickness = 5;
            break;
          case '5':
            lineThickness = 6;
            break;
          case '6':
            lineThickness = 7;
            break;
          case '7':
            lineThickness = 8;
            break;
          case '8':
            lineThickness = 9;
            break;
          case '9':
            lineThickness = 10;
            break;
        }
      }
      
      switch(event.key){
        case 'r':
          drawMode = 'line';
          break;
        case 't':
          drawMode = 'triangle';
          break;
        case 'e':
          inputMode = 'thickness';
          break;
        case 'k':
          inputMode = 'color';
          break;
      }
      drawLine();
    }

    function bresenham(x0, y0, x1, y1) {
      const points = [];
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;
      
      const pixelSize = 2 / canvas.width;
      let currentX = Math.round(x0 / pixelSize) * pixelSize;
      let currentY = Math.round(y0 / pixelSize) * pixelSize;
      
      while (true) {
        for (let i = 0; i < lineThickness; i++) {
          for (let j = 0; j < lineThickness; j++) {
            points.push(currentX + i * pixelSize, currentY + j * pixelSize);
          }
        }
        
        if (Math.abs(currentX - x1) < pixelSize && Math.abs(currentY - y1) < pixelSize) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          currentX += sx * pixelSize;
        }
        if (e2 < dx) {
          err += dx;
          currentY += sy * pixelSize;
        }
      }
      
      return points;
    }
    
    function drawTriangle(p1, p2, p3) {
      const points = [];
      points.push(...bresenham(p1.x, p1.y, p2.x, p2.y));
      points.push(...bresenham(p2.x, p2.y, p3.x, p3.y));
      points.push(...bresenham(p3.x, p3.y, p1.x, p1.y));
      return points;
    }
    
    function updateBuffer() {
      gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linePoints), gl.STATIC_DRAW);
    }

    function drawLine(){
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, linePoints.length / 2);
    }

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawLine();
}

main();