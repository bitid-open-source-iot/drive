const Q = require('q')
const ErrorResponse = require('./error-response')

exports.module = function () {
  var responder = {
    response: {
      update: (result) => {
        const deferred = Q.defer()

        deferred.resolve({
          updated: result.n
        })

        return deferred.promise
      },

      delete: (result) => {
        const deferred = Q.defer()

        deferred.resolve({
          deleted: result.n
        })

        return deferred.promise
      },

      files: {
        list: (result) => {
          const deferred = Q.defer()

          result = result.map(obj => {
            const tmp = {
              role: obj.role,
              fileId: obj._id,
              aliases: obj.aliases,
              filename: obj.filename,
              uploadDate: obj.uploadDate,
              contentType: obj.contentType
            }
            if (typeof (obj.metadata) !== 'undefined') {
              if (typeof (obj.metadata.bitid) !== 'undefined') {
                if (typeof (obj.metadata.bitid.auth) !== 'undefined') {
                  tmp.users = obj.metadata.bitid.auth.users
                  tmp.organizationOnly = obj.metadata.bitid.auth.organizationOnly
                };
              };
              tmp.size = obj.metadata.size
              tmp.appId = obj.metadata.appId
              tmp.token = obj.metadata.token
              tmp.serverDate = obj.metadata.serverDate
            };

            return tmp
          })

          deferred.resolve(result)

          return deferred.promise
        },

        upload: (result) => {
          const deferred = Q.defer()

          deferred.resolve({
            token: result.token,
            fileId: result._id
          })

          return deferred.promise
        }
      }
    },

    model: (req, result) => {
      const deferred = Q.defer()

      switch (req.originalUrl) {
        case ('*'):
        case ('/drive/config/get'):
          deferred.resolve(result)
          break

        case ('/drive/files/list'):
          responder.response.files.list(result).then(deferred.resolve, deferred.reject)
          break

        case ('/drive/files/upload'):
          responder.response.files.upload(result).then(deferred.resolve, deferred.reject)
          break

        case ('/drive/files/share'):
        case ('/drive/files/update'):
        case ('/drive/files/unsubscribe'):
        case ('/drive/files/change-owner'):
        case ('/drive/files/update-subscriber'):
          responder.response.update(result).then(deferred.resolve, deferred.reject)
          break

        case ('/drive/files/delete'):
          responder.response.delete(result).then(deferred.resolve, deferred.reject)
          break

        default:
          deferred.resolve({
            success: {
              details: 'your request resolved successfully but this payload is not modeled'
            }
          })
          break
      };

      return deferred.promise
    },

    error: (req, res, err) => {
      res.status(err.error.code).json(err.error)
    },

    success: (req, res, result) => {
      responder.model(req, result)
        .then(result => {
          res.json(result)
        }, error => {
          const err = new ErrorResponse()
          err.error.code = 503
          err.error.message = 'Issue in responder'
          err.error.errors[0].code = 503
          err.error.errors[0].reason = error.message
          err.error.errors[0].message = error.message
          responder.error(req, res, err)
        })
    }
  }

  return responder
}
