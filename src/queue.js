const initialize = (config) => {
  const NRP = require("node-redis-pubsub");
  const nrp = new NRP(config.dispatcher.io.redis);
  return {
    on: (...args) => nrp.on(...args),
    emit: (...args) => nrp.emit(...args),
    quit: (...args) => nrp.quit(...args)
  };
};

module.exports = initialize;