[![build status](https://secure.travis-ci.org/stagas/atomic.png)](http://travis-ci.org/stagas/atomic)
# atomic

Atomic operations


## Introduction

atomic lets you perform atomic operations based on keys. Additional tasks that
try to access the same key get queued up and executed when the previous task
calls `done()` to indicate it has finished its operation. It's useful when you
want to perform a multiple I/O calls on databases and don't want anything else
messing with your values in-between calls.


## Installation

`npm install atomic`


## Example

```javascript
var atomic = require('atomic')()

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
```


## Usage

### atomic(key, callback(done, key, arg1, arg2, ...) [, arg1, arg2, ...])

This creates an atomic operation on `key`. The callback is called when the key
is free (other tasks have finished working on it) and you must call `done()`
when you're finished your operations. For convenience, the key name and extra
arguments are passed to the callback for your function to use.
