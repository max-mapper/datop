#!/usr/bin/env node

var Datop = require('./')
var theme = require('./theme.json')
var host = process.argv[2]

var datop = Datop(host, theme)
