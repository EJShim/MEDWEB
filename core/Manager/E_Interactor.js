function E_Interactor(Mgr, renderer)
{
  this.Mgr = Mgr;
  this.renderer = renderer

  this.m_bMouseDown = false;

  this.Initialize();
}

E_Interactor.prototype.Initialize = function()
{
  //Add Event Listner
  var canvas = this.renderer.domElement;

  canvas.addEventListener('mousewheel', this.OnMouseWheel.bind(this), false);
  canvas.addEventListener('mousedown', this.OnMouseDown.bind(this), false );
  canvas.addEventListener('mouseup', this.OnMouseUp.bind(this), false );
  canvas.addEventListener('mousemove', this.OnMouseMove.bind(this), false );


  canvas.removeEventListener( 'touchstart', this.OnMouseDown.bind(this), false );
  canvas.removeEventListener( 'touchend', this.OnMouseUp.bind(this), false );
  canvas.removeEventListener( 'touchmove', this.OnMouseMove.bind(this), false );
}

E_Interactor.prototype.OnMouseDown = function()
{
  this.m_bMouseDown = true;
}

E_Interactor.prototype.OnMouseUp = function()
{
  this.m_bMouseDown = false;
}


E_Interactor.prototype.OnMouseMove = function()
{
  if(this.m_bMouseDown){
    this.Mgr.UploadScene();
  }
}

E_Interactor.prototype.OnMouseWheel = function()
{
  this.Mgr.UploadScene();
}

module.exports = E_Interactor;
