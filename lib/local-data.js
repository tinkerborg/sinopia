var fs   = require('fs')
var Path = require('path')

module.exports = LocalData

function LocalData(path) {
  var self = Object.create(LocalData.prototype)
  self.path = path
  self.updated = 0
  self.update()
  return self
}

LocalData.prototype.update = function(name) {
  var stat = fs.statSync(this.path)
  if (!stat) return
  var mtime = stat.mtime ? stat.mtime.getTime() : 0
  if (mtime <= this.updated) return
  try {
    this.data = JSON.parse(fs.readFileSync(this.path, 'utf8'))
    this.updated = mtime 
  } catch(_) {
    this.data = { list: [] }
    this.updated = 0
  }
}

LocalData.prototype.add = function(name) {
  if (this.data.list.indexOf(name) === -1) {
    this.data.list.push(name)
    this.sync()
  }
}

LocalData.prototype.remove = function(name) {
  var i = this.data.list.indexOf(name)
  if (i !== -1) {
    this.data.list.splice(i, 1)
  }

  this.sync()
}

LocalData.prototype.get = function() {
  this.update()
  return this.data.list
}

LocalData.prototype.sync = function() {
  // Uses sync to prevent ugly race condition
  try {
    require('mkdirp').sync(Path.dirname(this.path))
  } catch(err) {}
  fs.writeFileSync(this.path, JSON.stringify(this.data))
}

