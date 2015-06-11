var assert = require('chai').assert;
var QLearner = require('../QLearner');

describe('QLearner', function() {
  var qLearner;
  beforeEach(function() {
    qLearner = new QLearner();
  });

  describe('#angle', function() {
    it('computes angles in between quadrants', function() {
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

  describe('#buildActions', function() {
    it('builds evenly spaced actions', function() {
      var actions = qLearner.buildActions(4);
      assert.deepEqual(actions, {
        0: {xMultiplier: 0, yMultiplier: 0},
        1: {xMultiplier: 1, yMultiplier: 0},
        2: {xMultiplier: 0, yMultiplier: 1},
        3: {xMultiplier: -1, yMultiplier: 0},
        4: {xMultiplier: 0, yMultiplier: -1}
      }); });
  });
});
