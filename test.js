var Datop = require('./')
var theme = require('./theme.json')

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

var datop = Datop(theme, cpuPlugin)