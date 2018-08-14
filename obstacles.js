var pi = math.pi;
var  sq = math.sqrt(2);
function initObs(gl, width) {

  var z = width;
  var r = math.sqrt(2);
  const positionBuffer = gl.createBuffer();
  // var positions = new Array(9*180);
  
  const positions = [
      0.0, 0.0, z,
      -sq*math.cos(pi/8),sq*math.sin(pi/8),z,
      -sq*math.sin(pi/8),sq*math.cos(pi/8),z,      

      0.0, 0.0, z,
      -sq*math.sin(pi/8),sq*math.cos(pi/8),z,      
      sq*math.sin(pi/8),sq*math.cos(pi/8),z,      

      0.0, 0.0, z,
      sq*math.sin(pi/8),sq*math.cos(pi/8),z,      
      sq*math.cos(pi/8),sq*math.sin(pi/8),z,

      0.0, 0.0, z,
      sq*math.cos(pi/8),sq*math.sin(pi/8),z,
      sq*math.cos(pi/8),-sq*math.sin(pi/8),z,

  ];  
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // for (var i=0; i < 180; i++) {
    
  //   positions[i*9+0] = 0.0;
  //   positions[i*9+1] = 0.0; 
  //   positions[i*9+2] = z;

  //   positions[i*9+3] = r*math.cos(i*math.PI/180);
  //   positions[i*9+4] = r*math.sin(i*math.PI/180);
  //   positions[i*9+5] = z;

  //   positions[i*9+6] = r*math.cos((i+1)*math.PI/180);
  //   positions[i*9+7] = r*math.sin((i+1)*math.PI/180); 
  //   positions[i*9+8] = z;
    
  // }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const faceColors = [
    // [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  0.0,  0.0,  1.0],    // Back face: red
    // [0.0,  1.0,  0.0,  1.0],    // Top face: green
    // [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    // [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    // [1.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    // [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    // [1.0,  0.0,  0.0,  1.0],    // Top face: green
  ];

  var colors = [];
      var count=0;
      for (var j = 0; j< faceColors.length; j++) {
        const c = faceColors[j];
        colors = colors.concat(c, c, c);
        // count++;
    }
  // var colors = [];
  // const c = faceColors[0];
  // for (var i=0;i<180;i++) {
  //   colors = colors.concat(c, c, c);
  // }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

 const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  // var textureCoordinates = new Array(180*6);
  // for(var i=0;i<180;i++)
  // {
  const textureCoordinates = [
    // Front
    1.0,  0.0,
    1.0,  1.0,
    0.0,  0.0,

    1.0,  0.0,
    1.0,  1.0,
    0.0,  0.0,

    1.0,  0.0,
    1.0,  1.0,
    0.0,  0.0,

    1.0,  0.0,
    1.0,  1.0,
    0.0,  0.0,
    // 0.0,  1.0,
    // Back
      ];
  //     for(var j=0;j<6;j++)
  //       temptextureCoordinates[i*6+j]=temptextureCoordinates[j];
  // }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);


    const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  // var vertexNormals = new Array(180*9);
  // for(var i=0;i<180;i++)
  // {
  const vertexNormals = [
    // Front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     // 0.0,  0.0,  1.0,


  ];
  // for(var j=0;j<9;j++)
  //   vertexNormals[i*9+j]=tempvertexNormals[j];
  // }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                gl.STATIC_DRAW);



  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // var indices = new Array(180*3);
  // for (var i = 0; i<180;i++) {
    const indices = [
    0, 1, 2,
    3, 4, 5,
    6, 7, 8,
    9, 10, 11,
    ];
    // indices[i*3+0] = i*3+0;
    // indices[i*3+1] = i*3+1;
    // indices[i*3+2] = i*3+2;
  // }
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    normal: normalBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

function drawObs_text(gl, programInfo, buffers, texture, deltaTime, num) {
 
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }


  {
    const num = 2; // every coordinate composed of 2 values
    const type = gl.FLOAT; // the data in the buffer is 32 bit float
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}
  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);
{
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexNormal);
  }
  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  // {
  //   const numComponents = 4;
  //   const type = gl.FLOAT;
  //   const normalize = false;
  //   const stride = 0;
  //   const offset = 0;
  //   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  //   gl.vertexAttribPointer(
  //       programInfo.attribLocations.vertexColor,
  //       numComponents,
  //       type,
  //       normalize,
  //       stride,
  //       offset);
  //   gl.enableVertexAttribArray(
  //       programInfo.attribLocations.vertexColor);
  // }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix2);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix2[num]);

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);

  {
    const vertexCount = 12;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
  gl.flush();
  // Update the rotation for the next draw

}

function drawObs_color(gl, programInfo, buffers, deltaTime, num) {
 
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

// {
//     const numComponents = 3;
//     const type = gl.FLOAT;
//     const normalize = false;
//     const stride = 0;
//     const offset = 0;
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
//     gl.vertexAttribPointer(
//         programInfo.attribLocations.vertexNormal,
//         numComponents,
//         type,
//         normalize,
//         stride,
//         offset);
//     gl.enableVertexAttribArray(
//         programInfo.attribLocations.vertexNormal);
//   }
  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix2);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix2[num]);

  // gl.uniformMatrix4fv(
  //     programInfo.uniformLocations.normalMatrix,
  //     false,
  //     normalMatrix);

  {
    const vertexCount = 12;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
  //   gl.activeTexture(gl.TEXTURE0);

  // // Bind the texture to texture unit 0
  // gl.bindTexture(gl.TEXTURE_2D, texture);

  // // Tell the shader we bound the texture to texture unit 0
  // gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
  gl.flush();
  // Update the rotation for the next draw

}
