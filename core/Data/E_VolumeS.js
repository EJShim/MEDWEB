var AMI = require("ami.js");
var E_SliceImage = AMI.default.Helpers.Stack;
var E_Lut = AMI.default.Helpers.Lut;
var E_VolumeActor = AMI.default.Helpers.VolumeRendering;

function E_VolumeS(stack)
{
  this.SLICE_3D = 0;
  this.SLICE_AXL = 1;
  this.SLICE_COR = 2;
  this.SLICE_SAG = 3;

  //this.actor = null;

  //Prepare Volume Data
  var m_volumeData = stack;
  if(!m_volumeData.prepared){
    m_volumeData.prepare();
    m_volumeData.pack();
  }

  this.actor = null;

  //Init Slice Image
  var m_sliceImages = [];
  for(var i=0 ; i<4 ; i++){
    m_sliceImages[i] = new E_SliceImage(stack);
  }

  var m_lut = new E_Lut("ID_VIEW_LUT", "default", "linear");


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
    return m_sliceImages[idx];
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
  //Initialize Slice Image
  var sliceImages = this.GetSliceImage();

  //Main View Slice Image
  sliceImages[0].bbox.visible = false;
  sliceImages[0].border.color = 0xF44336;

  //AXL View Slice Image
  sliceImages[1].bbox.visible = false;
  sliceImages[1].border.color = 0xF40000;

  sliceImages[2].bbox.visible = false;
  sliceImages[2].border.color = 0x00F400;

  sliceImages[3].bbox.visible = false;
  sliceImages[3].border.color = 0x0000F4;


  //Set Volume Data Window Level
  var volumeData = this.GetVolumeData();
  var range = volumeData.minMax;
  volumeData.windowWidth = range[1] - range[0] - 1;
  volumeData.windowCenter = (range[1] + range[0] - 1) / 2;


  //SET OTP and CTP
  var CTPbone = [
    [0, 0, 0, 0],
    [.3, .73, .25, .30],
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

  //Add actor && Initialize Informations
  this.actor = new E_VolumeActor( volumeData );
  this.actor.uniforms.uLut.value = 1
  this.actor.uniforms.uWindowCenterWidth.value = [volumeData.windowCenter, volumeData.windowWidth];
}

E_VolumeS.prototype.UpdateLUT = function()
{
  var lut = this.GetLUT();
  lut.paintCanvas();
  this.actor.uniforms.uTextureLUT.value = lut.texture;

}

E_VolumeS.prototype.MoveSliceImage = function( value )
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

E_VolumeS.prototype.AddToRenderer = function(renderer)
{
  var center = this.GetVolumeData().worldCenter();
  renderer.scene.add(this.actor);

  renderer.camera.lookAt(center.x, center.y, center.z)
  renderer.camera.updateProjectionMatrix();
  renderer.control.target.set(center.x, center.y, center.z);



  var slice = this.GetSliceImage(0);
  renderer.scene.add(slice);
}

module.exports = E_VolumeS;
