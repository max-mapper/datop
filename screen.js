var blessed = require('blessed')
var through = require('through2')
var xtend = require('xtend')
var dataChart = require('./chart.js')

module.exports = Screen

function Screen(theme) {
  if (!(this instanceof Screen)) return new Screen(theme)
  var self = this
  var program = blessed.program()
  
  process.on('SIGINT', function() {
    program.clear()
    program.disableMouse()
    program.showCursor()
    program.normalBuffer()
    process.exit(0)
  })
  
  this.program = program
  this.screen = blessed.screen()
  this.theme = theme
  this.renderList = []
  
  setInterval(draw, 100)
  
  function draw() {
    if (self.renderList.length === 0) return
    for (var i = 0; i < self.renderList.length; i++) self.renderList[i].render()
    self.screen.render()
  }
}

Screen.prototype.createBox = function(opts) {
  var theme = this.theme
  var screen = this.screen
  if (!opts) opts = {}
  
  var defaults = {
    top: 1,
    left: 'left',
    width: '100%',
    height: '99%',
    content: '',
    fg: theme.chart.fg,
    tags: true,
    border: theme.chart.border
  }
  
  var box = blessed.box(xtend(defaults, opts))

  screen.append(box)
  screen.render()
  
  if (opts.title) box.setLabel(opts.title)
  
  return box
}

Screen.prototype.createChart = function() {
  var box = this.createBox()
  var chart = dataChart.create(box)
  var position = 0
  
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
  
  stream.chart = chart
  
  stream.render = function() {
    position++
    box.setContent(dataChart.draw(chart, position))
  }
  
  this.renderList.push(stream)
  
  return stream
}
