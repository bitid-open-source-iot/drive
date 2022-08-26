const Q = require('q')
const fetch = require('node-fetch')
const ErrorResponse = require('./error-response')

exports.load = async (args) => {
  const deferred = Q.defer()

  try {
    const payload = JSON.stringify({})

    if (typeof (args.req.headers['x-requested-with']) !== 'undefined' && args.req.headers['x-requested-with'] !== null) {
      args.req.headers.origin = args.req.headers['x-requested-with']
    }

    const response = await fetch([__settings.auth.host, '/apps/load'].join(''), {
      headers: {
        Accept: '*/*',
        Origin: args.req.headers.origin,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': payload.length
      },
      body: payload,
      method: 'PUT'
    })

    const result = await response.json()

    if (typeof (result.errors) !== 'undefined') {
      const err = new ErrorResponse()
      err.error.code = 401
      err.error.errors[0].code = 401
      err.error.errors[0].reason = result.errors[0].reason
      err.error.errors[0].message = result.errors[0].message
      deferred.reject(err)
    } else {
      args.result = result
      deferred.resolve(args)
    };
  } catch (error) {
    const err = new ErrorResponse()
    err.error.code = 401
    err.error.errors[0].code = 401
    err.error.errors[0].reason = error.message
    err.error.errors[0].message = error.message
    deferred.reject(err)
  };

  return deferred.promise
}

exports.isadmin = async (args) => {
  const deferred = Q.defer()

  try {
    if (__settings.authenticate !== true) {
      deferred.resolve(args)
    } else {
      const payload = JSON.stringify({
        header: args.req.body.header
      })

      const response = await fetch([__settings.auth.host, '/apps/is-admin'].join(''), {
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: args.req.headers.authorization,
          'Content-Length': payload.length
        },
        body: payload,
        method: 'PUT'
      })

      const result = await response.json()

      if (typeof (result.errors) !== 'undefined') {
        const err = new ErrorResponse()
        err.error.code = 401
        err.error.errors[0].code = 401
        err.error.errors[0].reason = result.errors[0].reason
        err.error.errors[0].message = result.errors[0].message
        deferred.reject(err)
      } else if (result.admin) {
        deferred.resolve(args)
      } else {
        const err = new ErrorResponse()
        err.error.code = 401
        err.error.errors[0].code = 401
        err.error.errors[0].reason = 'You must be an admin!'
        err.error.errors[0].message = 'You must be an admin!'
        deferred.reject(err)
      };
    }
  } catch (error) {
    const err = new ErrorResponse()
    err.error.code = 401
    err.error.errors[0].code = 401
    err.error.errors[0].reason = error.message
    err.error.errors[0].message = error.message
    deferred.reject(err)
  };

  return deferred.promise
}

exports.authenticate = async (args) => {
  const deferred = Q.defer()

  try {
    const payload = JSON.stringify({
      header: {
        email: args.req.body.header.email,
        appId: args.req.body.header.appId,
        userId: args.req.body.header.userId
      },
      scope: args.req.originalUrl
    })

    const response = await fetch([__settings.auth.host, '/auth/validate'].join(''), {
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: args.req.headers.authorization,
        'Content-Length': payload.length
      },
      body: payload,
      method: 'PUT'
    })

    const result = await response.json()

    if (typeof (result.errors) !== 'undefined') {
      const err = new ErrorResponse()
      err.error.code = 401
      err.error.errors[0].code = 401
      err.error.errors[0].reason = result.errors[0].reason
      err.error.errors[0].message = result.errors[0].message
      deferred.reject(err)
    } else {
      args.req.authorization.appId = result.appId || []
      args.req.authorization.userId = result.userId || args.req.body.header.userId
      args.req.authorization.groupId = result.groupId || []
      deferred.resolve(args)
    };
  } catch (error) {
    const err = new ErrorResponse()
    err.error.code = 401
    err.error.errors[0].code = 401
    err.error.errors[0].reason = error.message
    err.error.errors[0].message = error.message
    deferred.reject(err)
  };

  return deferred.promise
}
