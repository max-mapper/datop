var canvas = require('drawille')
var blessed = require('blessed')
var os = require('os')
var child_process = require('child_process')

var theme = {
  "name": "Wizard",
  "author": "James Hall",
  "title": {
    "fg": "#f43059"
  },
  "chart": {
    "fg": "#f43059",
    "border": {
      "type": "line",
      "fg": "white"
    }
  },
  "table": {
    "fg": "white",
    "items": {
      "selected": {
        "bg": "#f43059",
        "fg": "#000000"
      },
      "item": {
        "fg": "#ffffff",
        "bg": "#000000"
      }
    },
    "border": {
      "type": "line",
      "fg": "white"
    }
  },
  "footer": {
    "fg": "white"
  }
}

var cpuPlugin = {
  /**
   * This appears in the title of the graph
   */
  title: 'CPU Usage',
  /**
   * The type of sensor
   * @type {String}
   */
  type: 'chart',
  /**
   * The default interval time in ms that this plugin should be polled.
   * More costly benchmarks should be polled less frequently.
   */
  interval: 200,

  initialized: false,

  currentValue: 0,
  /**
   * Grab the current value, from 0-100
   */
  poll: function() {
    cpuPlugin.currentValue = Math.floor(Math.random() * 100)
    cpuPlugin.initialized = true
  }
}

module.exports = function() {
  var program = blessed.program()
  var screen
  var charts = {}
  var loadedTheme
  var intervals = []
  
  var upgradeNotice = false
  var disableTableUpdate = false
  var disableTableUpdateTimeout = setTimeout(function() {}, 0)
  
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
  
  init()
  
  function drawChart(chartKey) {
    var chart = charts[chartKey]
    var c = chart.chart
    c.clear()

    if (!charts[chartKey].plugin.initialized) {
      return false
    }

    var dataPointsToKeep = 5000

    charts[chartKey].values[position] = charts[chartKey].plugin.currentValue

    var computeValue = function(input) {
      return chart.height - Math.floor(((chart.height + 1) / 100) * input) - 1
    }
  
    if (position > dataPointsToKeep) {
      delete charts[chartKey].values[position - dataPointsToKeep]
    }
  
    for (var pos in charts[chartKey].values) {
      var p = parseInt(pos, 10) + (chart.width - charts[chartKey].values.length)
    
      if (p > 0 && computeValue(charts[chartKey].values[pos]) > 0) {
        c.set(p, computeValue(charts[chartKey].values[pos]))
      }
    
      for (var y = computeValue(charts[chartKey].values[pos]); y < chart.height; y ++) {
        if (p > 0 && y > 0) {
          c.set(p, y)
        }
      }
    }
  
    // Add percentage to top right of the chart by splicing it into the braille data
    var textOutput = c.frame().split("\n")
    var percent = '   ' + chart.plugin.currentValue
    textOutput[0] = textOutput[0].slice(0, textOutput[0].length - 4) + '{white-fg}' + percent.slice(-3) + '%{/white-fg}'

    return textOutput.join("\n")
  }

  function draw() {
    position++

    var chartKey = 'cpu'
    graph.setContent(drawChart(chartKey))
    
    screen.render()
  }
  
  function init() {
    screen = blessed.screen()
    
    graph = blessed.box({
      top: 1,
      left: 'left',
      width: '100%',
      height: '50%',
      content: '',
      fg: theme.chart.fg,
      tags: true,
      border: theme.chart.border
    })

    screen.append(graph)
    screen.render()
    
    graph.setLabel(' GRAPH!!! ')
    setupCharts()
    setInterval(draw, 100)
    setInterval(charts['cpu'].plugin.poll, charts['cpu'].plugin.interval)
  }
  
  function setupCharts() {
    size.pixel.width = (graph.width - 2) * 2
    size.pixel.height = (graph.height - 2) * 4
    var width, height, currentCanvas
    var plugin = "cpu"
    width = (graph.width - 3) * 2
    height = (graph.height - 2) * 4
    currentCanvas = new canvas(width, height)
    var values
    if (typeof charts[plugin] != 'undefined' && typeof charts[plugin].values != 'undefined') {
      values = charts[plugin].values
    } else {
      values = []
    }
    charts[plugin] = {
      chart: currentCanvas,
      values: values,
      plugin: cpuPlugin,
      width: width,
      height: height
    }
    charts[plugin].plugin.poll()
  }
}


function stringRepeat(string, num) {
  if (num < 0) return ''
  return new Array(num + 1).join(string)
}