var a = require('./modules/a')
var b = require('./modules/b')
var test = require('tap').test

test("both should callback", function (t) {
  t.plan(2)
  a(function () {
    t.pass("a called back")
  })
  b(function () {
    t.pass("b called back")
  })
})
