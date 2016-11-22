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

}

module.exports = E_VolumeManager;
