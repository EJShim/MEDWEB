function ES_MeshManager(Mgr)
{
  this.Mgr = Mgr;
  this.m_meshList = [];
}

ES_MeshManager.prototype.AddMesh = function(name)
{
  this.m_meshList.push(name);
}

ES_MeshManager.prototype.RemoveMesh = function(idx)
{
  var filename = this.m_meshList[idx];
  this.Mgr.Router().DeleteFile("./public/workingdata/" + filename);

  //Remove From Mesh listen
  this.m_meshList.splice(idx, 1);
}

ES_MeshManager.prototype.Destroy = function()
{
  for(var i in this.m_meshList){
    this.RemoveMesh(i);
  }
}

module.exports = ES_MeshManager;
