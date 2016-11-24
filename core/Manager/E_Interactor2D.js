var AMI = require("ami.js");
var E_OrthographicControl  = AMI.default.Controls.TrackballOrtho;

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

  canvas.addEventListener('mousewheel', this.OnMouseWheel.bind(this), false);
  canvas.addEventListener('mousedown', this.OnMouseDown.bind(this), false );
  canvas.addEventListener('mouseup', this.OnMouseUp.bind(this), false );
  canvas.addEventListener('mousemove', this.OnMouseMove.bind(this), false );


  canvas.addEventListener( 'touchstart', this.OnMouseDown.bind(this), false );
  canvas.addEventListener( 'touchend', this.OnMouseUp.bind(this), false );
  canvas.addEventListener( 'touchmove', this.OnMouseMove.bind(this), false );

  this.renderer.control = new E_OrthographicControl(this.renderer.camera, this.renderer.domElement );
  this.renderer.control.staticMoving = true;
  this.renderer.control.noRotate = true;
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


E_Interactor2D.prototype.OnMouseMove = function()
{
  if(this.m_bMouseDown){

  }

  this.Mgr.Redraw();
}

E_Interactor2D.prototype.OnMouseWheel = function(e)
{
  //console.log(e.wheelDelta);
  this.Mgr.VolumeMgr().MoveIndex(this.idx, e.wheelDelta);

  this.Mgr.Redraw();
}

module.exports = E_Interactor2D;
