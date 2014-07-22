var Drawille = require('drawille')
var prettybytes = require('pretty-bytes')

module.exports.create = function(box) {
  var width = (box.width - 3) * 2
  var height = (box.height - 2) * 4
  var canvas = new Drawille(width, height)
  var values = []
  var chart = {
    chart: canvas,
    values: values,
    width: width,
    height: height,
    ready: false,
    min: 0,
    max: 0
  }
  
  return chart
}

module.exports.resize = function(chart, box) {
  var width = (box.width - 3) * 2
  var height = (box.height - 2) * 4
  chart.chart = new Drawille(width, height)
  chart.width = width
  chart.height = height
}

module.exports.draw = function(chart, position) {
  var c = chart.chart
  c.clear()

  if (!chart.ready) {
    return false
  }
  
  var dataPointsToKeep = 1000

  chart.values[position] = chart.value

  if (position > dataPointsToKeep) {
    delete chart.values[position - dataPointsToKeep]
  }
  
  chart.min = 0
  chart.max = 0
  chart.average = 0
  
  // do first pass to determine min/max
  for (var i = 0; i < chart.width; i++) {
    var rawval = chart.values[chart.values.length - i]
    if (rawval > 0) {
      chart.average += rawval
      if (rawval < chart.min) chart.min = rawval
      if (rawval > chart.max) chart.max = rawval
    }
  }
  
  chart.average = chart.average / chart.width

  for (var pos in chart.values) {
    var p = parseInt(pos, 10) + (chart.width - chart.values.length)
    var pval = computeValue(chart.values[pos])
    
    if (p > 0 && pval > 0) {
      c.set(p, chart.height - 1)
    }
    
    for (var y = 0; y < pval; y++) {
      c.set(p, chart.height - y)
    }
  }

  // Add percentage to top right of the chart by splicing it into the braille data
  var textOutput = c.frame().split("\n")
  
  var msg = "avg: " + prettybytes(chart.average) + ', max: ' + prettybytes(chart.max)
  textOutput[0] = textOutput[0].slice(0, textOutput[0].length - msg.length) + msg

  return textOutput.join("\n")
  
  function computeValue(input) {
    return ~~scale(input, chart.min, chart.max, 0, chart.height)
  }
}

function scale( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}

function stringRepeat(string, num) {
  if (num < 0) return ''
  return new Array(num + 1).join(string)
}
