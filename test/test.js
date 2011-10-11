var atomic = require('../')()
  , test = require('tap').test

// a slow db emulation

var MemSlow = function () {
  this.data = {}
  this.speed = 20
}

MemSlow.prototype.set = function (key, val, callback) {
  var self = this
  setTimeout(function () {
    self.data[key] = val
    callback(null)
  }, Math.floor(Math.random() * this.speed))
}

MemSlow.prototype.get = function (key, callback) {
  var self = this
  setTimeout(function () {
    if ('undefined' === typeof self.data[key]) {
      return callback(new Error('Key not found: ' + key))
    }
    callback(null, self.data[key])
  }, Math.floor(Math.random() * this.speed))
}

// prepare

var slowDb = new MemSlow()

// tests

test("increment", function (t) {
  t.plan(1)
  var key = 'incr'
  for (var i = 1; i <= 100; i++) {
    atomic(key, function (done, key) {
      slowDb.get(key, function (err, data) {
        data = data || 0
        slowDb.set(key, ++data, function (err) {
          done()
        })
      })
    })
  }
  atomic(key, function (done, key) {
    slowDb.get(key, function (err, data) {
      t.equals(data, 100, "increment ok")
      done()
    })
  })
})

test("order", function (t) {
  t.plan(1)
  var key = 'order'
  var val = 'the order is important'
  for (var i = 0; i < val.length; i++) {
    atomic(key, function (done, key, i) {
      slowDb.get(key, function (err, data) {
        data = data || ''
        data += val[i]
        slowDb.set(key, data, function (err) {
          done()
        })
      })
    }, i)
  }
  atomic(key, function (done, key) {
    slowDb.get(key, function (err, data) {
      t.equals(data, val, "order ok")
      done()
    })
  })
})

test("multiple", function (t) {
  t.plan(2)
  var key1 = 'incr1'
  var key2 = 'incr2'
  for (var i = 1; i <= 100; i++) {
    atomic(key1, function (done, key) {
      slowDb.get(key, function (err, data) {
        data = data || 0
        slowDb.set(key, ++data, function (err) {
          done()
        })
      })
    })
  }
  for (var i = 1; i <= 100; i++) {
    atomic(key2, function (done, key) {
      slowDb.get(key, function (err, data) {
        data = data || 0
        slowDb.set(key, ++data, function (err) {
          done()
        })
      })
    })
  }  
  atomic(key1, function (done, key) {
    slowDb.get(key, function (err, data) {
      t.equals(data, 100, "multiple 1 ok")
      done()
    })
  })
  atomic(key2, function (done, key) {
    slowDb.get(key, function (err, data) {
      t.equals(data, 100, "multiple 2 ok")
      done()
    })
  })  
})