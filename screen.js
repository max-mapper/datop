var blessed = require('blessed')
var through = require('through2')
var xtend = require('xtend')
var dataChart = require('./chart.js')

module.exports = Screen

function Screen(host, theme) {
  if (!(this instanceof Screen)) return new Screen(host, theme)
  var self = this
  var program = blessed.program()
  process.program = program
  
  process.on('SIGINT', function() {
    self.kill()
  })
  
  this.program = program
  this.screen = blessed.screen()
  
  var headerText = ' {bold}datop{/bold} - ' + host
  var header = blessed.text({
    top: 'top',
    left: 'left',
    width: headerText.length,
    height: '1',
    fg: theme.title.fg,
    content: headerText,
    tags: true
  })
  
  this.screen.append(header)
  
  this.screen.on('resize', function() {
    for (var i = 0; i < self.renderList.length; i++) {
      var item = self.renderList[i]
      if (item.chart) dataChart.resize(item.chart, item.box)
    }
  })
  
  this.theme = theme
  this.renderList = []
  
  setInterval(draw, 1000)
  
  function draw() {
    if (self.renderList.length === 0) return
    var updatedHeader = headerText
    for (var i = 0; i < self.renderList.length; i++) {
      var item = self.renderList[i]
      item.render()
    }
    header.content = updatedHeader
    self.screen.render()
  }
}

Screen.prototype.kill = function() {
  this.program.clear()
  this.program.disableMouse()
  this.program.showCursor()
  this.program.normalBuffer()
  this.process.exit(0)
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

Screen.prototype.createChart = function(opts) {
  var box = this.createBox(opts)
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
  stream.box = box
  
  stream.render = function() {
    position++
    box.setContent(dataChart.draw(chart, position))
  }
  
  this.renderList.push(stream)
  
  return stream
}
