var createScreen = require('./screen.js')

module.exports = function(theme) {
  var screen = createScreen(theme)
  var chart = screen.createChart()
  setInterval(function() {
    chart.write(Math.floor(Math.random() * 100))
  }, 250)
}