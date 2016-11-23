var AMI = require("ami.js");
var glslify = require("glslify");
var E_SliceImage = AMI.default.Helpers.Stack;
var E_Lut = AMI.default.Helpers.Lut;


function E_Volume(stack)
{
  this.SLICE_3D = 0;
  this.SLICE_AXL = 1;
  this.SLICE_COR = 2;
  this.SLICE_SAG = 3;

  //Prepare Volume Data
  var m_volumeData = stack;
  if(!m_volumeData.prepared){
    m_volumeData.prepare();
    m_volumeData.pack();
  }

  //Init Slice Image
  var m_sliceImages = [];
  for(var i=0 ; i<4 ; i++){
    m_sliceImage[i] = new E_SliceImage(stack);
  }

  var m_lut = new E_Lut("ID_VIEW_VOLUME_LUT", "default", "linear");


  //Scene for Double Pass Rendering
  var m_sceneRTT = new THREE.Scene();
  var m_RTT = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {minFilter:THREE.LinearFilter, magFilter:THREE.NearestFilter, format:THREE.RGBAFormat}) ;



  this.GetVolumeData = function(){
    return m_volumeData;
  }

  this.GetLUT = function()
  {
    return m_lut;
  }

  this.GetSliceImage = function(idx)
  {
    if(idx == null) return m_sliceImages;
    return m_sliceImages[i];
  }

  this.GetSceneRTT= function(){
    return m_sceneRTT;
  }

  this.GetRTT = function(){
    return m_RTT;
  }

  this.Initialize();

  ///
  THREE.Mesh.call(this);
}

E_Volume.prototype = Object.create(THREE.Mesh.prototype);


E_Volume.prototype.Initialize = function()
{
  //Initialize Slice Image
  var sliceImages = this.GetSliceImage();

  //Main View Slice Image
  sliceImages[0].bBox.visible = true;
  sliceImages[0].border.color = 0xF44336;

  //AXL View Slice Image
  sliceImages[1].bBox.visible = false;
  sliceImages[1].border.color = 0xF40000;

  sliceImages[2].bBox.visible = false;
  sliceImages[2].border.color = 0x00F400;

  sliceImages[3].bBox.visible = false;
  sliceImages[3].border.color = 0x0000F4;



  //Initialize LUT
  var lut = this.GetLUT();
  var range = this.GetVolumeData().minMax;
  var width = range[1] - range[0];

  var CTPbone = [
    [0, 0, 0, 0],
    [.2, .73, .25, .30],
    [.6, .9, .82, .56],
    [1, 1, 1, 1]
  ];

  var OTPBone = [
    [0, 0],
    [1, 1]
  ]

  lut._color = CTPbone;
  lut._opacity = OTPbone;
}

E_Volume.prototype.MoveSliceImage = function( value )
{
  var sliceImages = this.GetSliceImage();
  if(value > 0){
    if(this.GetSliceImage(0).index >= this.GetVolumeData().dimensionsIJK.z -1 ) return;

    for(var i in sliceImages){
      sliceImages[i].index++;
    }
  }else{
    if(this.GetSliceImage(0).index <= 0) return;
    for(var i in sliceImages){
      sliceImages[i].index--;
    }
  }
}

E_Volume.prototype.GetBoundingBox = function(){
  return this.GetVolumeData().uniforms.uWorldBBox.value;
}

E_Volume.prototype.GetCenter = function(){
  return this.GetVolumeData().worldCenter();
}

E_Volume.prototype.SetCustomShader = function()
{
  //var offset = new THREE.Vector3(-0.5, -0.5, -0.5);
  var data = this.GetVolumeData();

  var boxGeometry = new THREE.BoxGeometry(
    data.dimensionsIJK.x-1,
    data.dimensionsIJK.y-1,
    data.dimensionsIJK.z-1
  );

  boxGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(
    data.halfDimensionsIJK.x - 0.5,
    data.halfDimensionsIJK.y - 0.5,
    data.halfDimensionsIJK.z - 0.5
  ));

  var uniformFirstPass = this.firstPassUniforms();
  uniformFirstPass.uWorldBBox.value = data.worldBoundingBox();

  var materialFirstPass = new THREE.ShaderMaterial({
    uniforms:uniformFirstPass,
    vertexShader:glslify.file("../GLSL/Volume_FirstPass.vert"),
    fragmentShader:glslify.file("../GLSL/Volume_FirstPass.frag"),
    side:THREE.BackSide
  });

  var boxMeshFirstPass = new THREE.Mesh(boxGeometry, materialFirstPass);
  boxMeshFirstPass.applyMatrix(data,_ijk2LPS);
  this.GetSceneRTT().add(boxMeshFirstPass);

  //Second Pass
  var textures = []
  for(var i=0 ; i<data.rawData.length ; i++){
    var tex = new THREE.DataTexture(
      data.rawData[i],
      data.textureSize,
      data.textureSize,
      data.textureType,
      THREE.UnsignedByteType,
      THREE.UVMapping,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      THREE.NearestFilter,
      THREE.NearestFilter
    );
    tex.needsUpdate = true;
    tex.flipY = true;
    textures.push(tex);
  }

  var uniformSecondPass = this.SecondPassUniforms();
  uniformSecondPass.uTextureSize.value = data.textureSize;
  uniformSecondPass.uTextureContainer.value = textures;
  uniformSecondPass.uWorldToData.value = data.lps2IJK;
  uniformSecondPass.uNumberOfChannels.value = data.numberOfChannels;
  uniformSecondPass.uBitsAllocated.value = data.bitsAllocated;
  uniformSecondPass.uWindowCenterWidth.value = [data.windowCenter, data.windowWidth];
  uniformSecondPass.uRescaleSlopeIntercept.value = [data.rescaleSlope, data.rescaleIntercept];
  uniformSecondPass.uTextureBlock.value = this.GetRTT().texture;
  uniformSecondPass.uWorldBBox.value = data.worldBoundingBox();
  uniformSecondPass.uLut.value = 1;
  uniformSecondPass.uDataDimensions.value = [data.dimensionsIJK.x,data.dimensionsIJK.y,data.dimensionsIJK.z];
  uniformSecondPass.uSteps.value = 512;
  uniformSecondPass.uInterpolation = 1;

  var materialSecondPass = new THREE.ShaderMaterial({
    uniforms:uniformSecondPass,
    vertexShader:glslify("../GLSL/Volume_SecondPass.vert"),
    fragmentShader:glslify("../GLSL/Volume_SecondPass.frag"),
    side:THREE.FrontSide,
    transparent:true
  });


  this.geometry = boxGeometry;
  this.material = materialSecondPass;
  this.applyMatrix(data._ijk2LPS);
}

E_Volume.prototype.UpdateLUT = function()
{
  var lut = this.GetLut();

  lut.paintCanvas();

  this.material.uniforms.uTextureLUT.value = lut.texture;
}

E_Volume.prototype.firstPassUniforms = function()
{
  return{
    'uWorldBBox':{
      type:'fv1',
      value:[0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    }
  };
}

E_Volume.prototype.SecondPassUniforms = function()
{
  return {
      'uTextureSize': {
        type: 'i',
        value: 0
      },
      'uTextureContainer': {
        type: 'tv',
        value: []
      },
      'uDataDimensions': {
        type: 'iv',
        value: [0, 0, 0]
      },
      'uWorldToData': {
        type: 'm4',
        value: new THREE.Matrix4()
      },
      'uWindowCenterWidth': {
        type: 'fv1',
        value: [0.0, 0.0]
      },
      'uRescaleSlopeIntercept': {
        type: 'fv1',
        value: [0.0, 0.0]
      },
      'uNumberOfChannels': {
        type: 'i',
        value: 1
      },
      'uBitsAllocated': {
        type: 'i',
        value: 8
      },
      'uTextureBack': {
        type: 't',
        value: null
      },
      'uWorldBBox': {
        type: 'fv1',
        value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
      },
      'uSteps': {
        type: 'i',
        value: 256
      },
      'uLut': {
        type: 'i',
        value: 0
      },
      'uTextureLUT':{
        type: 't',
        value: []
      },
      'uAlphaCorrection':{
        type: 'f',
        value: 1.0
      },
      'uFrequence':{
        type: 'f',
        value: 0.0
      },
      'uAmplitude':{
        type: 'f',
        value: 0.0
      },
      'uPixelType': {
        type: 'i',
        value: 0
      },
      'uInterpolation': {
        type: 'i',
        value: 0
      }
    };
}

module.exports = E_Volume;
