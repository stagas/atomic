var atomic = require('../../')()

module.exports = function (callback) {
  atomic('foo', function (done) {
    callback()
  })
}