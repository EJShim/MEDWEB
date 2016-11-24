var AMI = require("ami.js");
var E_DicomLoader = AMI.default.Loaders.Volume;
var E_Volume = require("../Data/E_Volume.js");
var E_VolumeS = require("../Data/E_VolumeS.js");
var E_Histogram = require("../Data/E_Histogram.js");


function E_VolumeManager(Mgr)
{


  this.Mgr = Mgr;

  this.m_selectedVolumeIdx = -1;
  this.m_selectedOpacityIndex = -1;
  this.m_volumeList = [];

  var m_histogram = new E_Histogram();

  this.GetHistogram = function(){
    return m_histogram;
  }
}

E_VolumeManager.prototype.ImportVolume = function(buffer)
{
  var that = this;

  var loader = new E_DicomLoader();
  var files = buffer;

  var seriesContainer = [];
  var loadSequence = [];

  files.forEach(function(url){
    loadSequence.push(
      Promise.resolve()
      .then(function(){
        return loader.fetch(url);
      })
      .then(function(data){
        return loader.parse(data);
      })
      .then(function(series){
        seriesContainer.push(series);
      })
      .catch(function(error){
        window.console.log("Volume Import Error : " + error);
      })
    );
  });

  Promise.all(loadSequence)
  .then(function(){
    loader.free();
    loader = null;

    var series = seriesContainer[0].mergeSeries(seriesContainer);
    var data = series[0].stack[0];

    var volume = new E_VolumeS(data);
    return volume
  })
  .then(function(volume){
    that.AddVolume(volume);
  })
  .then(function(){
    that.Mgr.Redraw();
  })
  .catch(function(error){
    window.console.log("Volme Add Error: " + error);
  })
}

E_VolumeManager.prototype.AddVolume = function(volume)
{
  var renderer = this.Mgr.GetRenderer();
  volume.AddToRenderer(renderer)
  //renderer.scene.add(volume);

  this.m_volumeList.push(volume);
  this.SetSelectedVolume(this.m_volumeList.length -1);
}

E_VolumeManager.prototype.SetSelectedVolume = function(idx){
  this.m_selectedVolumeIdx = idx;
  this.UpdateHistogram();
}

E_VolumeManager.prototype.GetSelectedVolume = function()
{
  return this.m_volumeList[ this.m_selectedVolumeIdx ];
}

E_VolumeManager.prototype.UpdateHistogram = function()
{
  if(this.m_selectedVolumeIdx == -1) return;
  var lut = this.GetSelectedVolume().GetLUT();

  this.GetHistogram().Update(lut)
}

E_VolumeManager.prototype.OnClickedOpacity = function(x, y)
{
  if(this.m_selectedVolumeIdx == -1) return;

  var canvas = document.getElementById("ID_VIEW_LUT");

  x = x/canvas.width;
  y = 1.0 - y/canvas.height;

  var otf = this.GetSelectedVolume().GetLUT()._opacity;

  for(var i=0 ; i<otf.length ; i++){
    if(Math.abs(otf[i][0]-x) < 0.1 && Math.abs(otf[i][1]-y) < 0.1){
      this.m_selectedOpacityIndex = i;
    }
  }

  if(this.m_selectedOpacityIndex == -1){
    this.GenerateOpacityPoint(x, y);
  }
}

E_VolumeManager.prototype.GenerateOpacityPoint = function(x,y)
{
  var otf = this.GetSelectedVolume().GetLUT()._opacity;

  for(var i=0 ; i<otf.length ; i++){
    if(x > otf[i][0] && x < otf[i+1][0]){
      otf.splice(i+1, 0, [x, y]);
      this.m_selectedOpacityIndex = i+1;
      break;
    }
  }

  this.GetSelectedVolume().UpdateLUT();
  this.UpdateHistogram();
  this.Mgr.Redraw();
}

E_VolumeManager.prototype.OnMoveOpacity = function(x, y)
{
  if(this.m_selectedVolumeIdx == -1) return;
  if(this.m_selectedOpacityIndex == -1) return;

  var canvas = document.getElementById("ID_VIEW_LUT");
  var volume = this.GetSelectedVolume();
  var otf = volume.GetLUT()._opacity;

  x = x/canvas.width;
  y = 1.0 - y/canvas.height;

  if(x < 0) x = 0;
  if(y < 0) y = 0;
  if(x > 1) x = 1;
  if(y > 1) y = 1;

  if(this.m_selectedOpacityIndex > 0){
    if(x < otf[this.m_selectedOpacityIndex-1][0]){
      x = otf[this.m_selectedOpacityIndex-1][0];
    }
  }else{
    x = 0;
  }

  if(this.m_selectedOpacityIndex < otf.length -1){
    if(x > otf[this.m_selectedOpacityIndex+1][0]){
      x = otf[this.m_selectedOpacityIndex+1][0];
    }
  }else{
    x = 1;
  }


  //Set otf
  otf[this.m_selectedOpacityIndex] = [x, y];

  //Update Volumevolume
  volume.UpdateLUT();

  this.UpdateHistogram();
  this.Mgr.Redraw();
}


E_VolumeManager.prototype.OnReleaseOpacity = function()
{
  this.m_selectedOpacityIndex = -1;
}

E_VolumeManager.prototype.MoveIndex = function(idx, delta)
{
  if(this.m_selectedVolumeIdx == -1) return;

  this.GetSelectedVolume().MoveSliceImage(idx, delta);
  this.Mgr.Redraw();
}

module.exports = E_VolumeManager;
