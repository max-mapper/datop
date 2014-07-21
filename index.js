var graph = require('./graph')

module.exports = function(theme, cpuPlugin) {
  var g1 = graph(theme, cpuPlugin)
  setInterval(function() {
    g1.write(Math.floor(Math.random() * 100))
  }, 250)
}