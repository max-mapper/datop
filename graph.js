var canvas = require('drawille')
var blessed = require('blessed')
var os = require('os')
var through = require('through2')
var child_process = require('child_process')

module.exports = function(theme, plugin) {
  var program = blessed.program()
  var screen
  var charts = {}
  var intervals = []
  var position = 0
  
  var size = {
    pixel: {
      width: 0,
      height: 0
    },
    character: {
      width: 0,
      height: 0
    }
  }

  var graph
  var processList
  var processListSelection
  
  return init()
  
  function init() {
    screen = blessed.screen()
    
    graph = blessed.box({
      top: 1,
      left: 'left',
      width: '100%',
      height: '99%',
      content: '',
      fg: theme.chart.fg,
      tags: true,
      border: theme.chart.border
    })

    screen.append(graph)
    screen.render()
    
    graph.setLabel('GRAPH!!!')
    var chart = createChart()
    
    var stream = through.obj(
      function write(obj, enc, next) {
        chart.ready = true
        chart.value = obj
        next()
      },
      function end() {
        chart.ready = false
      }
    )
    
    setInterval(draw, 100)
    
    function draw() {
      position++
      graph.setContent(drawChart(chart))
      screen.render()
    }
    
    return stream
  }
  
  function createChart() {
    size.pixel.width = (graph.width - 2) * 2
    size.pixel.height = (graph.height - 2) * 4
    var width = (graph.width - 3) * 2
    var height = (graph.height - 2) * 4
    var currentCanvas = new canvas(width, height)
    var values = []
    var chart = {
      chart: currentCanvas,
      values: values,
      width: width,
      height: height,
      ready: false
    }
    return chart
  }
  
  function drawChart(chart) {
    var c = chart.chart
    c.clear()

    if (!chart.ready) {
      return false
    }

    var dataPointsToKeep = 5000

    chart.values[position] = chart.value

    var computeValue = function(input) {
      return chart.height - Math.floor(((chart.height + 1) / 100) * input) - 1
    }
  
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
  }
}
