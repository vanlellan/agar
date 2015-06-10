/**
 * Agent
 *
 * Autonomous agent that plays agar.io
 *
 * Useage:
 *
 * agent = new Agent(state, controller);
 * agent.run();
 */
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var QLearner = require('./QLearner');

var DEFAULT_STEP_TIMEOUT = 100;
var LOG_DIR = path.resolve(__dirname, 'logs');

/**
 * Agent
 *
 * @param {GameState} state
 * @param {Controller} controller
 * @return {Agent}
 */
function Agent(state, controller) {
  _.bindAll(this);
  this.state = state;
  this.controller = controller;
  this.qLearner = new QLearner();
}
module.exports = Agent;

/**
 * run
 *
 * Start a run loop
 *
 * @param{number} stepTimeout Timeout in milliseconds to take between each step.
 * @return {undefined}
 */
Agent.prototype.run = function run(stepTimeout) {
  var self = this;

  // Only allow calling run once
  if (this.isRunning) {
    return;
  }
  this.isRunning = true;

  stepTimeout = stepTimeout || DEFAULT_STEP_TIMEOUT
  loop();

  function loop() {
    self.step();
    if (self.isRunning) {
      setTimeout(loop, stepTimeout);
    }
  }
};

/**
 * stop
 *
 * Stop the running agent
 *
 * @return {undefined}
 */
Agent.prototype.stop = function stop() {
  self.isRunning = false;
};

/**
 * step
 *
 * Take an in-game action
 *
 * @return {undefined}
 */
Agent.prototype.step = function step() {
  var user = this.state.getUserEntity();

  if (!user) {
    this.controller.sendInitMessage();
    this.controller.play();
    return;
  }

  var targetPosition = this.qLearner.step(this.state);
  this.controller.move(targetPosition.x, targetPosition.y);
};

/**
 * findNearestEntity
 *
 * Find the nearest entity that satisfies the predicate.
 *
 * @param {function(user, entity)} predicate Function that returns true/false.
 *   Filters entities to those that pass the predicate.
 * @return {undefined}
 */
Agent.prototype.findNearestEntity = function findNearestEntity(predicate) {
  var user = this.state.getUserEntity();
  var entities = this.state.getEntities();
  var nearestEntity = null;
  var nearestEntityDistance = Number.POSITIVE_INFINITY;

  _.each(entities, function(entity) {
    if (!predicate(user, entity)) {
      return;
    }

    var entityDistance = distance(user, entity);

    if (entityDistance < nearestEntityDistance) {
      nearestEntity = entity;
      nearestEntityDistance = entityDistance;
    }
  });

  return nearestEntity;
}

/**
 * logActionState
 *
 * TODO this probably belongs in a different module.
 * This logs the action state pair.
 *
 * @param state
 * @param action
 * @return {undefined}
 */
Agent.prototype.logActionState = function logActionState(state, action) {
  if (!this.outputStream) {
    var filename = 'action_state_' + (new Date()).toISOString() + '.log.jsonl';
    var logPath = path.resolve(LOG_DIR, filename);
    this.outputStream = fs.createWriteStream(logPath);
  }

  // prepare a single action/state log
  var output = {
    state: state.toJSON(),
    action: action
  };

  this.outputStream.write(JSON.stringify(output) + '\n', 'utf8');
};

/**
 * distance
 *
 * Calculate distance of entities from each other.
 *
 * @param entity1
 * @param entity2
 * @return {number}
 */
function distance(entity1, entity2) {
  var xDistance = entity1.x - entity2.x;
  var yDistance = entity1.y - entity2.y;
  var centerDistance = Math.sqrt((xDistance * xDistance) + (yDistance * yDistance));

  // The size is the radius, so remove it to get edge to edge distance
  return centerDistance - entity1.size - entity2.size;
}
