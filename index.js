var createScreen = require('./screen.js')
var request = require('request')
var ldj = require('ldjson-stream')
var through = require('through2')

module.exports = function(theme) {
  var screen = createScreen(theme)
  var chart = screen.createChart()
  var req = request('http://localhost:6461/api/stats')
  var parser = ldj.parse()
  var filter = through.obj(function(obj, enc, next) {
    filter.push(obj.http.written)
    next()
  })
  req.pipe(parser).pipe(filter).pipe(chart)
}