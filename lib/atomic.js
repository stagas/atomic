module.exports = function () {
  var keys = {}
  var slice = [].slice

  function run (key) {
    if (key in keys) {
      if (!keys[key].length) {
        delete keys[key]
      }
      else {
        var task = keys[key].shift()
        task.args.unshift(function () {
          run(key)
        }, key)
        task.fn.apply(this, task.args)
      }
    }
  }

  return function atomic (key, fn) {
    var task = { fn: fn, args: slice.call(arguments, 2) }
    if (!(key in keys)) {
      keys[key] = [ task ]
      run(key)
    }
    else {
      keys[key].push(task)
    }
  }
}
