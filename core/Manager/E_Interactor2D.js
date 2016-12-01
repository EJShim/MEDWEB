

function E_Interactor2D(Mgr, idx, renderer)
{
  this.Mgr = Mgr;
  this.renderer = renderer;
  this.idx = idx;

  this.m_bMouseDown = false;

  this.Initialize();
}

E_Interactor2D.prototype.Initialize = function()
{
  //Add Event Listner
  var canvas = this.renderer.domElement;

  canvas.addEventListener('mousewheel', this.OnMouseWheel.bind(this), {passive:true});
  canvas.addEventListener('mousedown', this.OnMouseDown.bind(this), false );
  canvas.addEventListener('mouseup', this.OnMouseUp.bind(this), false );
  canvas.addEventListener('mousemove', this.OnMouseMove.bind(this), false );


  canvas.addEventListener( 'touchstart', this.OnMouseDown.bind(this), false );
  canvas.addEventListener( 'touchend', this.OnMouseUp.bind(this), false );
  canvas.addEventListener( 'touchmove', this.OnMouseMove.bind(this), false );
}

E_Interactor2D.prototype.OnMouseDown = function()
{
  this.m_bMouseDown = true;

  this.Mgr.Redraw();
}

E_Interactor2D.prototype.OnMouseUp = function()
{
  this.m_bMouseDown = false;


  this.Mgr.Redraw();
}


E_Interactor2D.prototype.OnMouseMove = function(e)
{
  if(this.m_bMouseDown){
    //e.preventDefault();
    //console.log(e);
  }

  this.Mgr.Redraw();
}

E_Interactor2D.prototype.OnMouseWheel = function(e)
{

  this.Mgr.VolumeMgr().MoveIndex(this.idx, e.wheelDelta);

  this.Mgr.Redraw();
}


E_Interactor2D.prototype.Init2DView = function(xCos, yCos, zCos, bBox)
{
  var camera = this.renderer.camera;

  var camPos = bBox.center.clone().add( xCos.clone().normalize() );
  console.log(bBox.center);
  console.log(bBox.center.clone().add( xCos.clone().normalize() ));
  console.log(bBox.center.clone().add( yCos.clone().normalize() ));
  camera.position.set(camPos.x, camPos.y, camPos.z);
  camera.lookAt(bBox.center.x, bBox.center.y, bBox.center.z);
}



module.exports = E_Interactor2D;
