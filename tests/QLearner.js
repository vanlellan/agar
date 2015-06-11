var assert = require('chai').assert;
var QLearner = require('../QLearner');

describe('QLearner', function() {
  describe('#angle', function() {
    it('computes angles in between quadrants', function() {
      var qLearner = new QLearner();
      var angle;

      angle = qLearner.angle({x: 0, y: 0}, {x: 1, y: 0});
      assert.equal(angle, 0, '0');

      angle = qLearner.angle({x: 0, y: 0}, {x: 0, y: 1});
      assert.equal(angle, Math.PI / 2, '1/2 PI');

      angle = qLearner.angle({x: 0, y: 0}, {x: -1, y: 0});
      assert.equal(angle, Math.PI, 'PI');

      angle = qLearner.angle({x: 0, y: 0}, {x: 0, y: -1});
      assert.equal(angle, (3 / 2) * Math.PI, '3/2 PI');
    });

    it('computes angles in quadrants', function() {
      var qLearner = new QLearner();
      var angle;

      angle = qLearner.angle({x: 0, y: 0}, {x: 1, y: 1});
      assert.equal(angle, (1 / 4) * Math.PI, '1/4 PI');

      angle = qLearner.angle({x: 0, y: 0}, {x: -1, y: 1});
      assert.equal(angle, (3 / 4) * Math.PI, '3/4 PI');

      angle = qLearner.angle({x: 0, y: 0}, {x: -1, y: -1});
      assert.equal(angle, (5 / 4) * Math.PI, '5/4 PI');

      angle = qLearner.angle({x: 0, y: 0}, {x: 1, y: -1});
      assert.equal(angle, (7 / 4) * Math.PI, '7/4 PI');
    });
  });
});
