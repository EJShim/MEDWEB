var AMI = require("ami.js");
var E_DicomLoader = AMI.default.Loaders.Volume;
var E_Volume = require("../Data/E_Volume.js");
var E_Histogram = require("../Data/E_Histogram.js");


function E_VolumeManager(Mgr)
{
  this.Mgr = Mgr;


  this.m_selectedVolumeIdx = -1;
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
        console.log("Volume Import Error : " + error);
      })
    );
  });

  Promise.all(loadSequence)
  .then(function(){
    loader.free();
    loader = null;

    var series = seriesContainer[0].mergeSeries(seriesContainer);
    var data = series[0].stack[0];

    var volume = new E_Volume(stack);
    that.AddVolume(volume);
  })
  .then(function(){
    that.Manager.Redraw();
  })
  .catch(function(error){
    console.log("Volme Add Error: " + error);
  })
}

E_VolumeManager.AddVolume = function(volume)
{
  var scene = this.Manager.GetRenderer(this.Manager.VIEW_MAIN).scene;
  scene.add(volume);

  this.m_volumeList.push(volume);
  this.SetSelectedVolume(this.m_volumeList.length -1);
}

E_VolumeManager.prototype.SetSelectedVolume = function(idx){
  this.m_selectedVolumeIdx = idx;
}

E_VolumeManager.prototype.GetSelectedVolume = function()
{
  return this.m_volumeList[ this.m_selectedVolumeIdx ];
}

module.exports = E_VolumeManager;
