var Rotation = 0.0;
var collide = 0,pause=0;
var speed,y_height=0;
var incdist=0.03,levels=1;
var incscore=10,score=0;
var cflag=0,jflag=0,jpos=0.6;
var ObsRotation= Array(3).fill(0.0);
var pi = math.pi;
var dist=0,prev=-3;
var blocks=5;
var textmode=0;
var modelViewMatrix,projectionMatrix;
var modelViewMatrix2 = new Array(3),projectionMatrix2;
var deduce = new Array(3);
var rotflag = new Array(3);
// var colors = [];
// var positions = new Array(1000000);
// var indices = new Array(1000000);
var counter =9,counter1=2 ;
var width_arr = new Array(10);
var Obsposi = new Array(3);
main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  canvas.style = "position: absolute; top: 150px; left: 250px;"
  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
  function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 

// 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
  // Vertex shader program

    // attribute vec4 aVertexColor;
    // varying lowp vec4 vColor;
      // vColor = aVertexColor;
  const vsSource_text = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0, -0.8, 1.5));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;

  const vsSource_color = `
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
  // Fragment shader program

    // varying lowp vec4 vColor;
      // gl_FragColor = vColor;
      // gl_FragColor = texture2D(uSampler, vTextureCoord);
  const fsSource_text = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;
    uniform sampler2D uSampler;
    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
  `;

  const fsSource_color= `
    varying lowp vec4 vColor;
     void main(void) {
      gl_FragColor = vColor;
    }
  `;
  const shaderProgram_text = initShaderProgram(gl, vsSource_text, fsSource_text);
  const shaderProgram_color = initShaderProgram(gl, vsSource_color, fsSource_color);
  const programInfo_text = {
    program: shaderProgram_text,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram_text, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram_text, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgram_text, 'aTextureCoord'),
     // vertexColor: gl.getAttribLocation(shaderProgram_text, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram_text, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram_text, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram_text, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram_text, 'uSampler'),
    },
  };

    const programInfo_color = {
    program: shaderProgram_color,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram_color, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram_color, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram_color, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram_color, 'uModelViewMatrix'),
    },
  };
  for (var i=0;i<10;i++) {
  	width_arr[i] = i;
  }
  for(var i=0;i<3;i++){
    deduce[i] = math.random()*0.004 + 0.007;
    deduce[i].toFixed(3);
    deduce[i]=Number(deduce[i]);
  }
  for(var i=0;i<3;i++){
    rotflag[i]=math.floor(math.random()*2);
  }
  for (var i=0;i<3;i++) {
  	Obsposi[i] = -i*8-5;
  }
  const texture = loadTexture(gl, 'cubenew.jpeg');
  const texture1 = loadTexture(gl, 'obsnew.jpeg');
  document.addEventListener('keyup', function(event) {
    if(event.keyCode==84)
    {
      textmode=(1-textmode);
    }
    if(event.keyCode==32 && jflag==0 && collide==0 && pause==0)
    {
      jflag=1;
      speed = 0.15;
    }
    if(event.keyCode==80)
    {
      pause=1-pause;
      if(pause==1)
        document.getElementById("overlay").style.display = "block";
      else
        document.getElementById("overlay").style.display = "none";
    }
  });


  document.addEventListener('keydown', function(event) {
    if(event.keyCode == 37 && collide==0 && pause==0) {
  		Rotation+=0.04; 
      // console.log(Rotation);
      for(var i=0;i<3;i++)
      {
        ObsRotation[i]+=0.04;
      }
    }
    else if(event.keyCode == 39 && collide==0 && pause==0) {
    	Rotation-=0.04;
      // console.log(Rotation);
      for(var i=0;i<3;i++)
      {
        ObsRotation[i]-=0.04;
      }
    }
	});
  var then = 0;
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
	var width = 1;
	
  if (jflag) {
    speed -= 0.006;
    y_height += speed;
  }
  if (y_height<=0) {
    y_height = 0;
    jflag=0;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
	  // gl.enable(gl.SCISSOR_TEST);
	  // gl.scissor(300, 1000, 600, 600);
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  var fieldOfView = 60 * math.PI / 180;   // in radians
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var zNear = 0.1;
  var zFar = 100.0;
  projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);
  modelViewMatrix = mat4.create();
  document.getElementById("level").innerHTML = "Level:-"+ levels+"\tScore:-"+score;
  if(collide==0 && pause==0)
  {
    dist+=incdist;
  }
  if(math.abs(dist%80)<0.05 && math.abs(dist)>2)
  {
    levels+=1;
    incscore+=10;
    incdist+=0.02;
  }
  // else if(collide==1 && cflag==0)
  //   {dist-=0.15;cflag=1;}
  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [0.0, 1.0 - y_height, dist]);  // amount to translate
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              Rotation,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
  // mat4.rotate(modelViewMatrix,  // destination matrix
  //             modelViewMatrix,  // matrix to rotate
  //             cubeRotation * .7,// amount to rotate in radians
  //             [0, 1, 0]);       // axis to rotate around (X)
  fieldOfView = 60 * math.PI / 180;   // in radians
  aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  zNear = 0.1;
  zFar = 100.0;
  projectionMatrix2 = mat4.create();
  if(collide==0 && pause==0)
  {
  for (var i=0;i<3;i++){
    if(rotflag[i]==1)
      ObsRotation[i] -= deduce[i];
    else 
      ObsRotation[i] += deduce[i];
    
  }
  }
  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix2,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);
  for(var i=0;i<3;i++){
  modelViewMatrix2[i] = mat4.create();
  // dist+=0.1;
  mat4.translate(modelViewMatrix2[i],     // destination matrix
                 modelViewMatrix2[i],     // matrix to translate
                 [0.0, 1.0 - y_height, dist]);  // amount to translate
  mat4.rotate(modelViewMatrix2[i],  // destination matrix
              modelViewMatrix2[i],  // matrix to rotate
              ObsRotation[i],     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
  }
  	var buf=new Array(12);
    var obs=new Array(4);
  	for (var i=0;i<10;i++) {
  		if (dist-width_arr[i]*3 >= 3) {
  			width_arr[i] = width_arr[counter]+1;
  			// console.log(width_arr);
  			counter=(counter+1)%10;
  		}
  	}
  	for (var i=0;i<10;i++) {
  		buf[i] = initBuffers(gl, width_arr[i], i%8);
  	}
    // console.log(Obsposi);
    for (var i=0;i<3;i++) {
      if (dist+Obsposi[i] >= 0) {
        Obsposi[i] = -8+Obsposi[counter1];
        // console.log(Obsposi);
        counter1=(counter1+1)%3;
      }
    }
  	for(var i=0;i<3;i++)
  	   obs[i] = initObs(gl, Obsposi[i]);
    // for(var i=0;i<3;i++)  
    // 	drawObs(gl, programInfo_text, obs[i], texture1, deltaTime, i);
    if(textmode==1)
    {
      for(var i=0;i<10;i++)
      	drawScene_text(gl, programInfo_text, buf[i], texture, deltaTime);
      for(var i=0;i<3;i++)  
        drawObs_text(gl, programInfo_text, obs[i], texture1, deltaTime, i);
    }
    else
    {
      for(var i=0;i<10;i++)
        drawScene_color(gl, programInfo_color, buf[i], deltaTime);
      for(var i=0;i<3;i++)  
        drawObs_color(gl, programInfo_color, obs[i], deltaTime, i);
    }
    detect_collision();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function detect_collision()
{
  var tempang = new Array(3);
  var tempnum1;
  // var tempnum = Rotation/(2*pi);
  // tempnum = Rotation - 2*pi*tempnum;
  for(var i=0;i<3;i++){
      tempnum1 = math.floor(ObsRotation[i]/(2*pi));
      tempnum1 = ObsRotation[i]-2*pi*tempnum1;
      if(math.abs(dist+Obsposi[i])<0.05 && math.abs(Obsposi[i])-dist>=0)
      {
        // console.log(tempnum1);
        if(1- y_height>0)
        {
          if((tempnum1 >=5*pi/8 && tempnum1<=pi*13/8)||(tempnum1<= -3*pi/8 && tempnum1>=-11*pi/8))
          {
            console.log("collided");
            collide=1;
          }
          else
          {
            score+=incscore;            
          }
        }
        else if(1- y_height<0)
        {
          if((tempnum1 >=0 && tempnum1<=pi*5/8)||(tempnum1 >=2*pi-3*pi/8 && tempnum1<=pi*2)||(tempnum1<= 0 && tempnum1>=-3*pi/8)||(tempnum1<= -2*pi+5*pi/8 && tempnum1>=-2*pi))
          {
            console.log("collided");
            collide=1;
          }
          else
          {
            console.log("fuck off");
            score+=incscore;
          }
        }
        else
        {
          collide=1;
          console.log("collided");
        }
     }
  }
}

function initBuffers(gl, width, num) {

  var z = width;
  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
    -math.sqrt(2)*math.sin(pi/8),  -math.sqrt(2)*math.cos(pi/8), -3.0*z,
    -math.sqrt(2)*math.sin(pi/8),  -math.sqrt(2)*math.cos(pi/8), -3.0*(z+1),
    math.sqrt(2)*math.sin(pi/8),  -math.sqrt(2)*math.cos(pi/8), -3.0*z,
    math.sqrt(2)*math.sin(pi/8), -math.sqrt(2)*math.cos(pi/8),  -3.0*(z+1),

    -math.sqrt(2)*math.sin(pi/8),  -math.sqrt(2)*math.cos(pi/8), -3.0*z,
    -math.sqrt(2)*math.sin(pi/8), -math.sqrt(2)*math.cos(pi/8),  -3.0*(z+1),
    -math.sqrt(2)*math.cos(pi/8),  -math.sqrt(2)*math.sin(pi/8), -3.0*z,
    -math.sqrt(2)*math.cos(pi/8),  -math.sqrt(2)*math.sin(pi/8), -3.0*(z+1),

    
    -math.sqrt(2)*math.cos(pi/8),  -math.sqrt(2)*math.sin(pi/8), -3.0*z,
    -math.sqrt(2)*math.cos(pi/8),  -math.sqrt(2)*math.sin(pi/8), -3.0*(z+1),    
    -math.sqrt(2)*math.cos(pi/8),  math.sqrt(2)*math.sin(pi/8), -3.0*z,
    -math.sqrt(2)*math.cos(pi/8), math.sqrt(2)*math.sin(pi/8),  -3.0*(z+1),

    -math.sqrt(2)*math.sin(pi/8), math.sqrt(2)*math.cos(pi/8),  -3.0*z,
    -math.sqrt(2)*math.sin(pi/8), math.sqrt(2)*math.cos(pi/8),  -3.0*(z+1),
    -math.sqrt(2)*math.cos(pi/8),  math.sqrt(2)*math.sin(pi/8), -3.0*z,
    -math.sqrt(2)*math.cos(pi/8),  math.sqrt(2)*math.sin(pi/8), -3.0*(z+1),

    -math.sqrt(2)*math.sin(pi/8), math.sqrt(2)*math.cos(pi/8),  -3.0*z,
    -math.sqrt(2)*math.sin(pi/8), math.sqrt(2)*math.cos(pi/8), -3.0*(z+1),
    math.sqrt(2)*math.sin(pi/8),  math.sqrt(2)*math.cos(pi/8), -3.0*z,
    math.sqrt(2)*math.sin(pi/8),  math.sqrt(2)*math.cos(pi/8), -3.0*(z+1),

    math.sqrt(2)*math.sin(pi/8),  math.sqrt(2)*math.cos(pi/8), -3.0*z,
    math.sqrt(2)*math.sin(pi/8),  math.sqrt(2)*math.cos(pi/8), -3.0*(z+1),
    math.sqrt(2)*math.cos(pi/8),  math.sqrt(2)*math.sin(pi/8),-3.0*z,
    math.sqrt(2)*math.cos(pi/8),  math.sqrt(2)*math.sin(pi/8), -3.0*(z+1),

    math.sqrt(2)*math.cos(pi/8),  -math.sqrt(2)*math.sin(pi/8), -3.0*z,
    math.sqrt(2)*math.cos(pi/8),  -math.sqrt(2)*math.sin(pi/8), -3.0*(z+1),    
    math.sqrt(2)*math.cos(pi/8),  math.sqrt(2)*math.sin(pi/8), -3.0*z,
    math.sqrt(2)*math.cos(pi/8),  math.sqrt(2)*math.sin(pi/8), -3.0*(z+1),    

    math.sqrt(2)*math.sin(pi/8),  -math.sqrt(2)*math.cos(pi/8), -3.0*z,
    math.sqrt(2)*math.sin(pi/8),  -math.sqrt(2)*math.cos(pi/8), -3.0*(z+1),
    math.sqrt(2)*math.cos(pi/8),  -math.sqrt(2)*math.sin(pi/8), -3.0*z,
    math.sqrt(2)*math.cos(pi/8),  -math.sqrt(2)*math.sin(pi/8), -3.0*(z+1),    
    
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Right
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,

    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,

    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);
  const faceColors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Front face: white
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Front face: white
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Front face: white
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Front face: white

    // [1.0,  0.0,  0.0,  1.0],    // Back face: red
    // [0.0,  1.0,  0.0,  1.0],    // Top face: green
    // [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    // [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    // [1.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    // [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    // [1.0,  0.0,  0.0,  1.0],    // Top face: green
  ];

  var colors = [];
      var count=0;
      for (var j = num; count != faceColors.length; j=(j+1)%faceColors.length) {
        const c = faceColors[j];
        colors = colors.concat(c, c, c, c);
        count++;
    }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  const vertexNormals = [
    // Front
     0.0,  -1.0,  0.0,
     0.0,  -1.0,  0.0,
     0.0,  -1.0,  0.0,
     0.0,  -1.0,  0.0,

    // Back
     -1.0,  -1.0, 0.0,
     -1.0,  -1.0, 0.0,
     -1.0,  -1.0, 0.0,
     -1.0,  -1.0, 0.0,

    // Top
     -1.0,  0.0,  0.0,
     -1.0,  0.0,  0.0,
     -1.0,  0.0,  0.0,
     -1.0,  0.0,  0.0,

    // Bottom
     -1.0, 1.0,  0.0,
     -1.0, 1.0,  0.0,
     -1.0, 1.0,  0.0,
     -1.0, 1.0,  0.0,

    // Right
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Left
    1.0,  1.0,  0.0,
    1.0,  1.0,  0.0,
    1.0,  1.0,  0.0,
    1.0,  1.0,  0.0,

    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,
    
    1.0,  -1.0,  0.0,
    1.0,  -1.0,  0.0,
    1.0,  -1.0,  0.0,
    1.0,  -1.0,  0.0,

    // Left
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                gl.STATIC_DRAW);



  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = [
      0,  1,  2,     1, 2, 3,// front
      4,  5,  6,     5, 6, 7,// back
      8,  9, 10,     9, 10, 11,   // top
      12, 13 ,14,    13, 14, 15,// bottom
      16, 17, 18,    17, 18, 19,
      20, 21, 22,    21, 22, 23, // right
      24, 25, 26,    25, 26, 27,
      28, 29, 30,    29, 30, 31,
         // left
    ];
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

function editbuffers(gl){
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  if(dist-prev>=3)
  {
    for(var z=0;z<blocks-1;z++){
      for(var j=0;j<96;j++){
        // positions.shift();
        positions[z*96+j]=positions[(z+1)*96+j];
      }
    }
    for(var j=0;j<96;j++){
      if(j%3==2)
      {
        // positions.push(positions[(blocks-2)*96+j]-3);
        positions[(blocks-1)*96+j]=positions[(blocks-2)*96+j]-3;
      }
      else
      {
        // positions.push(positions[(blocks-2)*96+j]); 
        positions[(blocks-1)*96+j]=positions[(blocks-2)*96+j];
      }
    }
    prev=dist;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  const faceColors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  0.0,  1.0],    // Top face: green
  ];

  for(var z=0;z<blocks-1;z++){
      for(var j=0;j<32;j++){
        // positions.shift();
        colors[z*32+j]=positions[(z+1)*32+j];
      }
    }
  // for(var j=0;j<32;j++)
  // {
  //   colors.shift();
  // }
  // console.log("Entered the loop");
  var randnum;
  randnum = math.floor(math.random()*(8));
  var count=0;
  var temp_clr = [];
  for (var j = randnum; count != faceColors.length; j=(j+1)%faceColors.length) {
  // var j=0;
  // while(j<faceColors.length)
  // {
    // console.log(j);
    const c = faceColors[j];
    // const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    temp_clr = temp_clr.concat(c, c, c, c);
    count++;
      // j++;
  }
  for(var j=0;j<32;j++)
    colors[(blocks-1)*32+j]=temp_clr[j];
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  // gl.clear(gl.ELEMENT_ARRAY_BUFFER);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
  new Uint16Array(indices), gl.STATIC_DRAW);
  // console.log(positions.length);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
  }
}
//
// Draw the scene.
//
function drawScene_text(gl, programInfo, buffers, texture, deltaTime) {
 
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
  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);
  {
    const vertexCount = 48;
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

function drawScene_color(gl, programInfo, buffers, deltaTime) {
 
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
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  // gl.uniformMatrix4fv(
  //     programInfo.uniformLocations.normalMatrix,
  //     false,
  //     normalMatrix);
  {
    const vertexCount = 48;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;

    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
  gl.flush();
  // Update the rotation for the next draw

}
//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

