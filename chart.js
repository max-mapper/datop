var Drawille = require('drawille')

module.exports.create = function(graph) {
  var width = (graph.width - 3) * 2
  var height = (graph.height - 2) * 4
  var canvas = new Drawille(width, height)
  var values = []
  var chart = {
    chart: canvas,
    values: values,
    width: width,
    height: height,
    ready: false
  }
  
  return chart
}

module.exports.draw = function(chart, position) {
  var c = chart.chart
  c.clear()

  if (!chart.ready) {
    return false
  }

  var dataPointsToKeep = 5000

  chart.values[position] = chart.value

  if (position > dataPointsToKeep) {
    delete chart.values[position - dataPointsToKeep]
  }

  for (var pos in chart.values) {
    var p = parseInt(pos, 10) + (chart.width - chart.values.length)

    if (p > 0 && computeValue(chart.values[pos]) > 0) {
      c.set(p, computeValue(chart.values[pos]))
    }

    for (var y = computeValue(chart.values[pos]); y < chart.height; y ++) {
      if (p > 0 && y > 0) {
        c.set(p, y)
      }
    }
  }

  // Add percentage to top right of the chart by splicing it into the braille data
  var textOutput = c.frame().split("\n")
  var percent = '   ' + chart.value
  textOutput[0] = textOutput[0].slice(0, textOutput[0].length - 4) + '{black-fg}' + percent.slice(-3) + '%{/black-fg}'

  return textOutput.join("\n")
  
  function computeValue(input) {
    return chart.height - Math.floor(((chart.height + 1) / 100) * input) - 1
  }
}
