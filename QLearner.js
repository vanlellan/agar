/**
 * QLearner
 *
 * Teaches a Q-Learning algorithm to play agar.io
 *
 * Useage:
 * var qLearner = new QLearner();
 * var targetPosition = qLearner.step(state);
 * // move towards target position
 * // repeat
 *
 * TODO(ibash) make a QLearner.save and QLearner.load...
 * TODO(ibash) make standalone functions to teach QLearner offline
 */

var _ = require('lodash');
var ml = require('ml-js');

function QLearner() {
  this.currentActionIndex = null;
  this.currentState = null;
  this.numEntitiesInVector = 20;

  // Number of directions we let our entity move in.
  this.numDirections = 10;

  // Number of features, calculated as:
  // numFeaturesPerEntity * numEntitiesInVector + 4 distance to walls
  this.numFeatures = (5 * this.numEntitiesInVector) + 4;

  this.actions = this.buildActions(this.numDirections);
  this.mlQLearningAgent = this.buildQLearner(this.numFeatures, this.actions);
}
module.exports = QLearner;

/**
 * step
 *
 * Learn from the state change and return back the next target position the user
 * should move to.
 *
 * @param nextState
 * @return {Object} like:
 *   x: {number}
 *   y: {number}
 */
QLearner.prototype.step = function step(nextState) {
  var previousState = this.currentState;
  this.currentState = nextState;

  // currentActionIndex gets updated at the end (after learning)
  var previousActionIndex = this.currentActionIndex;

  var previousStateVector = previousState && this.stateToVector(previousState);
  var currentStateVector = this.stateToVector(this.currentState);

  if (previousState) {
    var reward = this.calculateReward(previousState, this.currentState);
    this.mlQLearningAgent.learn(previousStateVector, previousActionIndex,
                                currentStateVector, reward);
  }

  this.currentActionIndex = this.mlQLearningAgent.getAction(currentStateVector);

  return this.actionToTargetPosition(this.currentActionIndex,
                                     this.currentState.getUserEntity());
};

/**
 * buildActions
 *
 * Actions consist of leveled angles in the direction we can move or
 * standing still.
 *
 * That is here is one possible set of actions:
 *   Dont move
 *   Angle between 0-15 degrees full speed ahead
 *   Angle between 15-30 degrees full speed ahead
 *   ...
 *   Angle between 340-0 degrees full speed ahead
 *
 * @param {number} numDirections Number of directions actions should point to.
 * @return {Array(Object}} Map from action index to an object like:
 *   xMultiplier: {number}
 *   yMultiplier: {number}
 */
QLearner.prototype.buildActions = function buildActions(numDirections) {
  var actions = {};

  // "Don't move" action
  actions[0] = {
    xMultiplier: 0,
    yMultiplier: 0
  };

  var delta = (2 * Math.PI) / numDirections;
  for (var i = 0; i < numDirections; i++) {
    var angle = delta * i;
    var action = {
      xMultiplier: Math.cos(angle),
      yMultiplier: Math.sin(angle),
    };

    if (Math.abs(action.xMultiplier) < 1.0e-5) {
      action.xMultiplier = 0;
    }

    if (Math.abs(action.yMultiplier) < 1.0e-5) {
      action.yMultiplier = 0;
    }

    // i + 1 since 0 is taken by no movement
    actions[i + 1] = action;
  }

  return actions;
};

/**
 * buildQLearner
 *
 * @param numFeatures
 * @param actions
 * @return {ml.QLearningAgent}
 */
QLearner.prototype.buildQLearner = function buildQLearner(numFeatures, actions) {
  // Convert actions to array as expected.
  var actions = _.keys(actions);

  var qValues = new ml.CSDAQValues({
    nbFeatures: numFeatures,
    actions: actions
  });

  // TODO(ibash) tweak these
  return new ml.QLearningAgent({
    qValues: qValues,
    actions: actions,
    learning_rate: 0.1,
    discount_factor: 0.9,
    exploration_policy: new ml.BoltzmannExploration(0.2)
  });
};

/**
 * actionToTargetPosition
 *
 * @param {number} actionIndex
 * @param {Object} user User's entity.
 * @return {Object} like:
 *   x: {number}
 *   y: {number}
 */
QLearner.prototype.actionToTargetPosition = function actionToTargetPosition(actionIndex, user) {
  var action = this.actions[actionIndex];
  // speed is ... idk, in this case we just point to a distance twice the
  // diameter of the user
  var speed = user.size * 4;

  return {
    x: user.x + (speed * action.xMultiplier),
    y: user.y + (speed * action.yMultiplier)
  };
};

/**
 * stateToVector
 *
 * Convert a state object to a vector that can be inputted into the q-learning
 * algorithm.
 *
 * TODO(ibash) should we look at the closest entities first?
 *
 * Note that size in the vector is relative to the user.
 * Also note that the user entity is not included in the vector.
 *
 * Currently the state vector will look like:
 * [
 *   distance to top wall,
 *   distance to bottom wall,
 *   distance to left wall,
 *   distance to right wall,
 *   1st entity size,
 *   1st entity angle,
 *   1st entity distance,
 *   1st entity is virus,
 *   1st entity exists,
 *   ...
 *   50th entity size,
 *   50th entity angle,
 *   50th entity distance,
 *   50th entity is virus,
 *   50th entity exists
 * ]
 *
 * @param state
 * @return {Array(number)}
 */
QLearner.prototype.stateToVector = function stateToVector(state) {
  var self = this;
  var vector = [];
  var user = state.getUserEntity();
  var boardSize = state.getBoardSize();

  // Distance to top, bottom, left, right from the edge of the entity.
  vector.push(user.y - user.size); // top
  vector.push(boardSize.y - (user.y + user.size)); // bottom
  vector.push(user.x - user.size); // left
  vector.push(boardSize.x - (user.x + user.size)); // right

  var entities = this.nClosestSortedEntities(this.numEntitiesInVector, user, state.getEntities());
  var entitiesCount = 0;
  _.each(entities, function(entity) {
    if (entity.id === user.id) {
      return;
    }

    entitiesCount++;

    // Calculate all vector attributes relative to user and push them on.
    var entityVector = [
      entity.size - user.size,
      self.angle(user, entity),
      self.distance(user, entity),
      entity.isVirus ? 1 : 0,
      1 // entity exists
    ];
    vector.push.apply(vector, entityVector);
  });

  // Pad out the vector.
  for (var i = entitiesCount; i < this.numEntitiesInVector; i++) {
    var emptyVector = [0, 0, 0, 0, 0];
    vector.push.apply(vector, emptyVector);
  }

  return vector;
};

/**
 * nClosestSortedEntities
 *
 * Gets the n closest entities to source (that are not source). Entities are
 * returned in sorted order.
 *
 * @param {number} n
 * @param {Object} source
 * @param {Array(Object)} entities
 * @return {Array(Object)}
 */
QLearner.prototype.nClosestSortedEntities = function nClosestSortedEntities(n, source, entities) {

  var self = this;

  var sorted = _.sortBy(entities, function(entity) {
    return self.distance(source, entity);
  });

  if (sorted[0] === source.id) {
    sorted.shift();
  }

  return sorted.slice(0, n);
};

/**
 * distance
 *
 * Calculates the distance (edge to edge) from the source entity to the target
 * entity.
 *
 * @param {Object} source Entity to calulate the distance from.
 * @param {Object} target Entity to calculate the distance to.
 * @return {number}
 */
QLearner.prototype.distance = function distance(source, target) {
  var xDistance = source.x - target.x;
  var yDistance = source.y - target.y;
  var centerDistance = Math.sqrt((xDistance * xDistance) + (yDistance * yDistance));

  // The size is the radius, so remove it to get edge to edge distance
  return centerDistance - source.size - target.size;
};

/**
 * angle
 *
 * Calculates the angle that the target entity is at from the source entity.
 * Angles are calculates from the standard position, that is angle of 0 is to
 * the right and angle of pi/2 is to the top.
 *
 * @param {Object} source Entity to calulate the angle from.
 * @param {Object} target Entity to calculate the angle of.
 * @return {number}
 */
QLearner.prototype.angle = function angle(source, target) {
  var xDelta = target.x - source.x;
  var yDelta = target.y - source.y;
  var angle = Math.atan2(yDelta, xDelta);
  if (angle < 0) {
    angle += 2 * Math.PI;
  }

  return angle;
};

/**
 * calculateReward
 *
 * Calculate the reward between two states.
 *
 * @param state
 * @param nextState
 * @return {number}
 */
QLearner.prototype.calculateReward = function calculateReward(state, nextState) {
  var user = state.getUserEntity();
  var nextUser = nextState.getUserEntity();
  if (user.id === nextUser.id) {
    // 1 for staying alive and 100 for growing
    return 100 * (nextUser.size - user.size);
  } else {
    // the user died
    // TODO(ibash) get a better way to detect this
    return -1000;
  }
}
