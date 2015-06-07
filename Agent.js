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

var DEFAULT_STEP_TIMEOUT = 50;

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

  this.controller.move(user.x + 2000, user.y + 2000);
};
