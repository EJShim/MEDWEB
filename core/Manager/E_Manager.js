var E_MeshManager = require("./E_MeshManager.js");
var E_VolumeManager = require("./E_VolumeManager.js");
var E_SocketManager = require("./E_SocketManager.js");
var E_Interactor = require("./E_Interactor.js");
var E_Interactor2D = require("./E_Interactor2D.js");

var AMI = require("ami.js");
var E_OrthographicCamera = AMI.default.Cameras.Orthographic;


function E_Manager()
{
  this.NUM_VIEW = 4;

  this.VIEW_MAIN = 0;
  this.VIEW_2D_AXL = 1;
  this.VIEW_2D_COR = 2;
  this.VIEW_2D_SAG = 3;


  //Renderer
  var m_renderer = [];

  //Render Window
  var m_renderWindow = [];

  //Mesh Manager
  var m_meshManager = new E_MeshManager(this);
  var m_volumeManager = new E_VolumeManager(this);
  var m_socketManager = new E_SocketManager(this);

  this.GetRenderer = function(idx){
    if(idx == null) return m_renderer;
    return m_renderer[idx];
  }

  this.GetRenderWindow = function(idx){
    if(idx == null) return m_renderWindow;
    return m_renderWindow[idx];
  }

  this.MeshMgr = function(){
    return m_meshManager;
  }

  this.VolumeMgr = function(){
    return m_volumeManager;
  }

  this.SocketMgr = function(){
    return m_socketManager;
  }
}

E_Manager.prototype.Initialize = function()
{
  var renderer = this.GetRenderer();
  var renWin = this.GetRenderWindow();

  //Initialize Render Widnow
  renWin[0] = $$("ID_VIEW_MAIN");
  renWin[1] = $$("ID_VIEW_AXL");
  renWin[2] = $$("ID_VIEW_COR");
  renWin[3] = $$("ID_VIEW_SAG");

  for(var i =0 ; i<this.NUM_VIEW ; i++){
    //Initialize renderer
    renderer[i] = new THREE.WebGLRenderer({preserveDrawingBuffer:true, alpha:true});

    //Create Scene and Camear
    renderer[i].scene = new THREE.Scene();

    //Add light
    renderer[i].pointLight = new THREE.PointLight(0xffffff);
    renderer[i].scene.add(renderer[i].pointLight);

    //Initialize Camera
    if(i == 0){

      renderer[i].camera = new THREE.PerspectiveCamera( 45, renWin[i].$width/renWin[i].$height, 0.1, 10000000000 );
    }else{
      renderer[i].camera = new E_OrthographicCamera( renWin[i].$width / -2, renWin[i].$width / 2, renWin[i].$height / 2, renWin[i].$height / -2, 0.1, 100000 );
    }

    renderer[i].camera.position.set(0, 0, -20);
    renderer[i].camera.lookAt(new THREE.Vector3(0, 0, 0));


    //Attach to the Viewport
    renWin[i].getNode().replaceChild(renderer[i].domElement, renWin[i].$view.childNodes[0] );


    //Initialize Interactor && Trackball controls
    if(i == 0){
      renderer[i].interactor = new E_Interactor(this, renderer[i]);
    }else{
      renderer[i].interactor = new E_Interactor2D(this, i-1, renderer[i]);
    }

  }

  renderer[0].setClearColor(0x0a001a);
  renderer[1].setClearColor(0x150000);
  renderer[2].setClearColor(0x001500);
  renderer[3].setClearColor(0x000015);
  //Initialize Renderer Size
  this.UpdateWindowSize();

  //Redraw
  this.Redraw();
}

E_Manager.prototype.Animate = function()
{
  //Update Main View TrackballControls;
  for(var i=0 ; i<4 ; i++){
    this.GetRenderer(i).control.update();
  }

  requestAnimationFrame( this.Animate.bind(this) );
}

E_Manager.prototype.Redraw = function()
{
  this.UpdateCamera();
  this.Render();
}

E_Manager.prototype.OnViewOneView = function()
{
  //HIDE 2D View
  $$("ID_VIEW_2D").hide();
  this.OnResize();
}

E_Manager.prototype.OnViewFourView = function()
{
  $$("ID_VIEW_2D").show();
  this.OnResize();
}

E_Manager.prototype.UpdateCamera = function()
{
  //Get Renderer and viewport
  var renderer = this.GetRenderer();

  //Set PointLight of Main VIEW_MAIN
  for(var i in renderer)
  {
    renderer[i].pointLight.position.set( renderer[i].camera.position.x, renderer[i].camera.position.y, renderer[i].camera.position.z );
  }

  //Emit scene
  var data = renderer[0].control.object.position;
}

E_Manager.prototype.Render = function()
{
  var renderer = this.GetRenderer();

  //Render
  for(var i in renderer){

      // if(i == this.VIEW_MAIN && this.VolumeMgr().m_selectedVolumeIdx != -1){
      //   //Volume Rendering
      //   var volume = this.VolumeMgr().GetSelectedVolume();
      //
      //   var sceneRTT = volume.GetSceneRTT();
      //   var RTT = volume.GetRTT();
      //
      //   renderer[i].render(sceneRTT, renderer[i].camera, RTT, true);
      // }


      renderer[i].render(renderer[i].scene, renderer[i].camera);
  }
}

E_Manager.prototype.ResetCamera = function()
{
  var meshMgr = this.MeshMgr();
  var scene = this.GetRenderer(this.VIEW_MAIN).scene;
  var control = this.GetRenderer(this.VIEW_MAIN).control;

  var target = new THREE.Vector3(0, 0, 0);
  var count = 0;

  scene.traverse(function(object){
    if(object instanceof THREE.Mesh){
      target.add( meshMgr.GetCenter(object) );
      count++;
    }

    target.divideScalar(count);
    control.target = target;
    control.update();
  });
}

E_Manager.prototype.OnResize = function()
{
  this.UpdateWindowSize();

  this.Redraw();
}

E_Manager.prototype.UpdateWindowSize = function()
{
  //Get Renderer and viewport
  var renderer = this.GetRenderer();
  var renWin = this.GetRenderWindow();

  for(var i=0 ; i<this.NUM_VIEW ; i++){
    renderer[i].setSize(renWin[i].$width, renWin[i].$height);
    renderer[i].camera.aspect = renWin[i].$width/renWin[i].$height;
    renderer[i].camera.updateProjectionMatrix();

    renderer[i].control.handleResize();

  }

  //Update Histogram canvas
  this.VolumeMgr().GetHistogram().OnResizeCanvas();
  if(this.VolumeMgr().m_selectedVolumeIdx != -1){
    var volume = this.VolumeMgr().GetSelectedVolume();
    this.VolumeMgr().GetHistogram().Update(volume.GetLUT());
  }
}


E_Manager.prototype.ResetTreeItems = function()
{
  var tree = $$("ID_VIEW_TREE");
  tree.clearAll();

  tree.add({ id:"ID_TREE_MESH", open:true, value:"Mesh"});
  tree.add({ id:"ID_TREE_VOLUME", open:false, value:"Volume"});


  var meshList = this.MeshMgr().m_meshList;
  for(var i in meshList){
    var mesh = meshList[i];
    tree.add({id:i, value:mesh.name}, i, "ID_TREE_MESH");
    tree.checkItem(i);
  }
}

E_Manager.prototype.UploadScene = function()
{
  var control = this.GetRenderer(this.VIEW_MAIN).control;
  var camera = control.object;
  var data = {pos:camera.position, rot:camera.rotation, up:camera.up, tar:control.target};
  this.SocketMgr().EmitData("SIGNAL_SCENE", data);
}

module.exports = E_Manager;
