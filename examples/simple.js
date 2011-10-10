var atomic = require('../')

var o = {} // here's our db

for (var i = 1; i <= 100; i++) {
  // create an atomic operation on key 'foo'
  atomic('foo', function (done, key, i) {
    setTimeout(function () {
      o[key] = i // store i in o[key]
      done() // done with this task, "unlock" key
             // and move to the next task in queue
    }, Math.floor(Math.random() * 50)) // sometime in the future
  }, i) // pass i to the arguments (closure)
}

atomic('foo', function (done, key) {
  console.log(o[key])
  done()
})
