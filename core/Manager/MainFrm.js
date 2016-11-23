//Define Header
var E_Manager = require("./E_Manager.js");

//Initialize Manager
var Manager = new E_Manager();
Manager.Initialize();
Manager.Animate();

///////////////////////////////////INTERACTION EVENTS////////////////////////////////
/// Resizing Events

$(window).resize(function(){
  Manager.OnResize();
});

$$("ID_LEFT_AREA").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_MAIN").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_AXL").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_COR").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_SAG").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_FOOTER").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_SEGMENT_RESIZE").attachEvent("onChange", function(newV, oldV){

  //console.log(newV);

  if(newV == "ID_BUTTON_VIEW_1VIEW"){
    Manager.OnViewOneView();
  }else{
    Manager.OnViewFourView();
  }
});


///Tree Events
$$("ID_VIEW_TREE").attachEvent("onItemCheck", function(id){
  if(this.isBranch()) return;

  var checkState = this.isChecked(id);
  Manager.MeshMgr().BroadcastCheckState(id, checkState);
  Manager.MeshMgr().ShowHide(id, checkState);
});

$$("ID_VIEW_TREE").attachEvent("onItemClick", function(id){
  //this.select(id);
  Manager.MeshMgr().SetSelectedMesh(id);
});

$$("ID_VIEW_TREE").attachEvent("onItemDblClick", function(){
  console.log("Item DBlClicked");
});

$$("ID_VIEW_TREE").attachEvent("onKeyPress", function(code, e){
  if(e.key == "Backspace" || e.key == "Delete"){
    Manager.MeshMgr().BroadcastMeshRemove();
    Manager.MeshMgr().RemoveMesh();
  }
});

$$("ID_UPLOAD_VOLUME").attachEvent("onItemClick", function(){
  var parent = $$("ID_UPLOAD_VOLUME").getNode().childNodes[0];

  //Create File Dialog
  var fileDialog = document.createElement("input");
  fileDialog.setAttribute("type", "file");
  fileDialog.setAttribute("multiple", true);
  fileDialog.click();
  parent.appendChild(fileDialog);

  fileDialog.addEventListener("change", function(ev){
  //console.log(ev.target.files);

  var buffer = []
  for(var i=0 ; i<ev.target.files.length ; i++){
    var path = URL.createObjectURL(ev.target.files[i]);
    buffer.push(path);
  }
  Manager.VolumeMgr().ImportVolume(buffer);

  //Remove File Dialog Element
  parent.removeChild(fileDialog);
  });
});


///Chat module
$$("ID_CHAT_INPUT").attachEvent("onKeyPress", function(code, e){
  if(e.key == "Enter"){

    var userData = $$("ID_CHAT_USER").getValue();
    var valueData = this.getValue();

    var data = {user:userData, value:valueData};
    ///Clear Form
    Manager.SocketMgr().EmitData("SIGNAL_CHAT", data);

    //Clear
    ///this.setValue("");
  }
});
