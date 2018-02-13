var nested = require('libnested')

function isFunction (f) {
  return 'function' === typeof f
}

function isObject (o) {
  return o && 'object' === typeof o
}

exports.name = 'muxrpcperf'
exports.version = '1.0.0'
exports.manifest = {}
exports.init = function (sbot, config) {

  var calls = {}

  function createHook(path) {
    return function (fn, args) {
      nested.set(calls, path, nested.get(calls, path, 0) + 1)
      return fn.apply(this, args)
    }
  }

  function recurse (obj, path) {
    for(var k in obj)
      if(obj[k] && isFunction(obj[k].hook))
        obj[k].hook(createHook(path.concat(k)))
      else if(isObject(obj[k]))
        recurse(obj[k], path.concat(k))
  }

  recurse(sbot, [])

  sbot.status.hook(function (fn, args) {
    var status = fn.apply(this, args)
    status.muxrpcperf = calls
    return status
  })

}
