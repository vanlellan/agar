var _ = require('lodash');
var Canvas = require('canvas');
var fs = require('fs');

exports.render = function render(game) {
  var scale = 10;
  var maxX = game.maxX / scale;
  var maxY = game.maxY / scale;
  var canvas = new Canvas(maxX, maxY);
  var ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, maxX, maxY);

  ctx.save();
  ctx.rect(0, 0, maxX, maxY);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.restore();
  
  _.each(game.players, function(player) {
    ctx.save();
    ctx.strokeStyle = 'blue';
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(player.data.x / scale, player.data.y / scale, player.data.size / scale, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  });

  return canvas;
};

exports.loop = function loop(game) {
  render();

  function render() {
    var canvas = exports.render(game);
    fs.writeFile('frame.png', canvas.toBuffer());

    setTimeout(render, 16);
  }
};
