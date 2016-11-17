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