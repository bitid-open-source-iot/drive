const dal = require('../dal/dal')
const auth = require('../lib/auth')
const tools = require('../lib/tools')

exports.module = function () {
  const bllFiles = {
    get: (req, res) => {
      const args = {
        req,
        res
      }
      const myModule = new dal.module()
      myModule.files.get(args)
    },

    list: (req, res) => {
      const args = {
        req,
        res
      }

      const myModule = new dal.module()
      myModule.files.list(args)
        .then(tools.setRoleList, null)
        .then(args => {
          __responder.success(req, res, args.result)
        }, err => {
          __responder.error(req, res, err)
        })
    },

    share: (req, res) => {
      const args = {
        req,
        res
      }

      const myModule = new dal.module()
      myModule.files.share(args)
        .then(args => {
          __responder.success(req, res, args.result)
        }, err => {
          __responder.error(req, res, err)
        })
    },

    update: (req, res) => {
      const args = {
        req,
        res
      }

      const myModule = new dal.module()
      myModule.files.update(args)
        .then(args => {
          __responder.success(req, res, args.result)
        }, err => {
          __responder.error(req, res, err)
        })
    },

    upload: (req, res) => {
      req.originalUrl = req.originalUrl.split('?')[0]

      const args = {
        req,
        res
      }

      const myModule = new dal.module()
      myModule.files.upload(args)
        .then(args => {
          __responder.success(req, res, args.result)
        }, err => {
          __responder.error(req, res, err)
        })
    },

    delete: (req, res) => {
      const args = {
        req,
        res
      }

      const myModule = new dal.module()
      myModule.files.delete(args)
        .then(args => {
          __responder.success(req, res, args.result)
        }, err => {
          __responder.error(req, res, err)
        })
    },

    unsubscribe: (req, res) => {
      const args = {
        req,
        res
      }

      const myModule = new dal.module()
      myModule.files.unsubscribe(args)
        .then(args => {
          __responder.success(req, res, args.result)
        }, err => {
          __responder.error(req, res, err)
        })
    },

    updatesubscriber: (req, res) => {
      const args = {
        req,
        res
      }

      const myModule = new dal.module()
      myModule.files.updatesubscriber(args)
        .then(args => {
          __responder.success(req, res, args.result)
        }, err => {
          __responder.error(req, res, err)
        })
    }
  }

  const bllConfig = {
    get: async (req, res) => {
      const args = {
        req,
        res
      }

      auth.load(args)
        .then(args => {
          const result = JSON.parse(JSON.stringify(__settings.client))
          result.icon = args.result.icon
          result.appId = args.result.appId
          result.theme = args.result.theme
          result.appName = args.result.name
          result.favicon = args.result.favicon
          __responder.success(req, res, result)
        }, err => {
          __responder.error(req, res, err)
        })
    }
  }

  return {
    files: bllFiles,
    config: bllConfig
  }
}
