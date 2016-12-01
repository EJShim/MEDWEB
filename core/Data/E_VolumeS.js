var AMI = require("ami.js");
var E_SliceImage = AMI.default.Helpers.Stack;
var E_Lut = AMI.default.Helpers.Lut;
var E_VolumeActor = AMI.default.Helpers.VolumeRendering;
var glslify = require("glslify");

function E_VolumeS(stack)
{
  this.SLICE_AXL = 0;
  this.SLICE_COR = 1;
  this.SLICE_SAG = 2;

  //this.actor = null;

  //Prepare Volume Data
  var m_volumeData = stack;
  if(!m_volumeData.prepared){
    m_volumeData.prepare();
    m_volumeData.pack();
  }

  this.actor = null;

  //Init Slice Image
  var m_3DsliceImages = [];
  var m_2DsliceImages = [];



  var m_lut = new E_Lut("ID_VIEW_LUT", "default", "linear");


  this.GetVolumeData = function(){
    return m_volumeData;
  }

  this.GetLUT = function()
  {
    return m_lut;
  }

  this.Get3DSliceImage = function(idx)
  {
    if(idx == null) return m_3DsliceImages;
    return m_3DsliceImages[idx];
  }

  this.Get2DSliceImage = function(idx)
  {
    if(idx == null) return m_2DsliceImages;
    return m_2DsliceImages[idx];
  }

  this.GetSceneRTT= function(){
    return m_sceneRTT;
  }

  this.GetRTT = function(){
    return m_RTT;
  }

  this.Initialize();
  this.UpdateLUT();
}


E_VolumeS.prototype.Initialize = function()
{

  //Set Volume Data Window Level
  var volumeData = this.GetVolumeData();
  var range = volumeData.minMax;
  volumeData.windowWidth = range[1] - range[0] - 1;
  volumeData.windowCenter = (range[1] + range[0] - 1) / 2;


  //SET OTP and CTP
  var CTPbone = [
    [0, 0, 0, 0],
    [.5, .73, .25, .30],
    [.6, .9, .82, .56],
    [1, 1, 1, 1]
  ];

  var OTPbone = [
    [0, 0],
    [1, 1]
  ]

  var lut = this.GetLUT();
  lut._color = CTPbone;
  lut._opacity = OTPbone;



  //Build Slice Images

  //Initialize Slice Image
  var sliceImages3D = this.Get3DSliceImage();
  var sliceImages2D = this.Get2DSliceImage();

  for(var i=0 ; i<4 ; i++){
    sliceImages3D[i] = new E_SliceImage( volumeData );
    sliceImages2D[i] = new E_SliceImage( volumeData );
  }

  //AXL
  sliceImages3D[0].bbox.visible = false;
  sliceImages3D[0].border.color = 0xF40000;

  sliceImages2D[0].bbox.visible = false;
  sliceImages2D[0].border.color = 0xF40000;

  //COR
  sliceImages3D[1].slice.planeDirection = new THREE.Vector3(0, 1, 0);
  sliceImages3D[1].up = new THREE.Vector3(1, 0, 0);
  sliceImages3D[1].border.helpersSlice = sliceImages3D[1].slice;
  sliceImages3D[1].border.color = 0x00F400;
  sliceImages3D[1].bbox.visible = false;

  sliceImages2D[1].slice.planeDirection = new THREE.Vector3(0, 1, 0);
  sliceImages2D[1].border.helpersSlice = sliceImages2D[1].slice;
  sliceImages2D[1].border.color = 0x00F400;
  sliceImages2D[1].bbox.visible = false;

  //SAG
  sliceImages3D[2].slice.planeDirection = new THREE.Vector3(1, 0, 0);
  sliceImages3D[2].border.helpersSlice = sliceImages3D[2].slice;
  sliceImages3D[2].border.color = 0x0000F4;
  sliceImages3D[2].bbox.visible = false;

  sliceImages2D[2].slice.planeDirection = new THREE.Vector3(1, 0, 0);
  sliceImages2D[2].border.helpersSlice = sliceImages2D[2].slice;
  sliceImages2D[2].border.color = 0x0000F4;
  sliceImages2D[2].bbox.visible = false;


  //Add actor && Initialize Informations
  this.actor = new E_VolumeActor( volumeData );

  //this.actor._material.vertexShader = glslify.file("../GLSL/Volume_FirstPass.vert");
  this.actor._material.fragmentShader = glslify.file("../GLSL/Volume_SinglePass.frag");;

  //console.log(this.actor._material.vertexShader);
  //console.log(this.actor._material.fragmentShader);

  this.actor.uniforms.uLut.value = 1
  this.actor.uniforms.uAlphaCorrection.value = 1.0;
  this.actor.uniforms.uWindowCenterWidth.value = [volumeData.windowCenter, volumeData.windowWidth];

}

E_VolumeS.prototype.UpdateLUT = function()
{
  var lut = this.GetLUT();
  lut.paintCanvas();
  this.actor.uniforms.uTextureLUT.value = lut.texture;
}

E_VolumeS.prototype.MoveSliceImage = function(idx, value )
{
  var sliceImage3D = this.Get3DSliceImage(idx);
  var sliceImage2D = this.Get2DSliceImage(idx);

  if(value > 0){
    if(sliceImage3D.index >= this.GetVolumeData().dimensionsIJK.z -1 ) return;
      sliceImage3D.slice.planePosition.x += 0.625;
      sliceImage2D.slice.planePosition.x += 0.625;

  }else{
    if(sliceImage3D.index <= 0) return;
    sliceImage3D.slice.planePosition.x -= 0.625;
    sliceImage2D.slice.planePosition.x -= 0.625;

  }
}

E_VolumeS.prototype.AddToRenderer = function(renderers)
{
  var volumeData = this.GetVolumeData();
  var center = volumeData.worldCenter();

  var worldbb = volumeData.worldBoundingBox();
    var lpsDims = new THREE.Vector3(
      worldbb[1] - worldbb[0],
      worldbb[3] - worldbb[2],
      worldbb[5] - worldbb[4]
    );

  var bbox = {
    center: center,
    halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10)
  };


  renderers[0].scene.add(this.actor);
  renderers[0].camera.lookAt(center.x, center.y, center.z)
  renderers[0].camera.updateProjectionMatrix();
  renderers[0].control.target.set(center.x, center.y, center.z);

  for(var i=0 ; i<3 ; i++){
    //Add Slice Image in 3D Renderer
    var slice3D = this.Get3DSliceImage(i);
    renderers[0].scene.add(slice3D);

    // Add slice Image in 2D renderer
    var slice2D = this.Get2DSliceImage(i);
    renderers[i+1].scene.add(slice2D);
  }


  // //Reset 2D Camera
  renderers[1].interactor.Init2DView(volumeData.xCosine, volumeData.yCosine, volumeData.zCosine, bbox);
  renderers[2].interactor.Init2DView(volumeData.zCosine, volumeData.xCosine, volumeData.yCosine, bbox);
  renderers[3].interactor.Init2DView(volumeData.yCosine, volumeData.zCosine, volumeData.xCosine, bbox);
  // renderers[1].camera.init(volumeData.xCosine, volumeData.yCosine, volumeData.zCosine, renderers[1].control, bbox, renderers[1].domElement);
  // renderers[2].camera.init(volumeData.zCosine, volumeData.xCosine, volumeData.yCosine, renderers[2].control, bbox, renderers[2].domElement);
  // renderers[3].camera.init(volumeData.yCosine, volumeData.zCosine, volumeData.xCosine, renderers[3].control, bbox, renderers[3].domElement);
}


module.exports = E_VolumeS;
