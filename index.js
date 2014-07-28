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
    
    var read = screen.createChart({
      height: "48%",
      width: "100%",
      title: "Read"
    })
    
    var written = screen.createChart({
      height: "49%",
      width: "100%",
      top: '52%',
      title: "Written"
    })
    
    var parser = ldj.parse()
    
    // number of initial stats to skip (heisenberg - requesting stats causes stats to change)
    var skip = 2
    
    var filter = through.obj(function(obj, enc, next) {
      if (skip !== 0) {
        skip--
        return next()
      }
      written.write(obj.http.written + obj.level.written + obj.blobs.written)
      read.write(obj.http.read + obj.level.read + obj.blobs.read)
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
