function E_Histogram()
{
  this.renderWindow = $$("ID_VIEW_VOLUME_LUT");
  this.domElement = document.createElement('canvas');
  this.domElement.setAttribute("id", "ID_VIEW_LUT");


  this.Initialize();
}

E_Histogram.prototype.Initialize = function()
{
  this.renderWindow.getNode().replaceChild(this.domElement, this.renderWindow.getNode().childNodes[0]);
  this.OnResizeCanvas();

  //Set Attribute ID of canvas

}

E_Histogram.prototype.OnResizeCanvas = function()
{
  this.domElement.width = this.renderWindow.$width;
  this.domElement.height = this.renderWindow.$height;
}

E_Histogram.prototype.Update = function(lut)
{
  var ctx = this.domElement.getContext('2d');
  ctx.clearRect(0, 0, this.domElement.width, this.domElement.height);

  var color = ctx.createLinearGradient(0, 0, this.domElement.width, 0);

  for(var i=0 ; i<lut._color.length ; i++){
    color.addColorStop(lut._color[i][0], 'rgba(' + Math.round(lut._color[i][1] * 255) + ", " + Math.round(lut._color[i][2] * 255) + "," + Math.round(lut._color[i][3] * 255) + ", 1)" );
  }

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, this.domElement.width, this.domElement.height);

  var opacity = ctx.createLinearGradient(0, 0, this.domElement.width, 0);

  for(var i=0 ; i<lut._opacity.length ; i++){
    opacity.addColorStop(lut._opacity[i][0], "rgba(255, 255, 255, " + lut._opacity[i][1] + ")");
  }

  ctx.fillStyle = opacity;
  ctx.fillRect(0, 0, this.domElement.width, this.domElement.height);

  //Add Opacity Point
  ctx.globalCompositeOperation = "source-over";

  for(var i=0 ; i<lut._opacity.length ; i++){

    var x = lut._opacity[i][0] * this.domElement.width;
    var y = this.domElement.height - lut._opacity[i][1] * this.domElement.height;

    ctx.lineTo(x, y);
    ctx.arc(x, y, 2, 0, 2*Math.PI, true);
    ctx.stroke();

    ctx.moveTo(x, y);
  }

}

module.exports = E_Histogram;
