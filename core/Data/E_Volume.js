var AMI = require("ami.js");

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


  //Scene for Double Pass Rendering
  var m_sceneRTT = new THREE.Scene();
  var m_RTT = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {minFilter:THREE.LinearFilter, magFilter:THREE.NearestFilter, format:THREE.RGBAFormat}) ;



  this.GetVolumeData = function(){
    return m_volumeData;
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

}

module.exports = E_Volume;
