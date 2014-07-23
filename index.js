var createScreen = require('./screen.js')
var request = require('request')
var ldj = require('ldjson-stream')
var through = require('through2')

module.exports = function(host, theme) {
  if (!host) host = "http://localhost:6461"
  else host = normalizeURL(host)
  
  var api = host + '/api/stats'
  var req = request(api)
  
  req.on('error', function(e) {
    console.error('Connection error!', api, e.message)
  })
  
  req.on('response', function() {
    var screen = createScreen(host, theme)
    
    var httpRead = screen.createChart({
      height: "48%",
      width: "50%",
      title: "HTTP Read"
    })
    var httpWritten = screen.createChart({
      height: "49%",
      width: "50%",
      top: '52%',
      title: "HTTP Written"
    })
    var levelRead = screen.createChart({
      height: "48%",
      left: "51%",
      width: '49%',
      title: "Level Read"
    })
    var levelWritten = screen.createChart({
      height: "49%",
      width: '49%',
      left: '51%',
      top: '52%',
      title: "Level Written"
    })
    
    var parser = ldj.parse()
    var filter = through.obj(function(obj, enc, next) {
      httpWritten.write(obj.http.written)
      httpRead.write(obj.http.read)
      levelWritten.write(obj.level.written)
      levelRead.write(obj.level.read)
      next()
    })
    req.pipe(parser).pipe(filter)
    
  })
}

function normalizeURL(urlString) {
  // strip trailing /
  if (urlString[urlString.length - 1] === '/') urlString = urlString.slice(0, urlString.length - 1)
  
  if (!urlString.match(/^http:\/\//)) urlString = 'http://' + urlString
  
  return urlString
}
