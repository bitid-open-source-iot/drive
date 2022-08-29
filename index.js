const Q = require('q')
const db = require('./db/mongo')
const cors = require('cors')
const auth = require('./lib/auth')
const http = require('http')
const chalk = require('chalk')
const express = require('express')
const responder = require('./lib/responder')
const fileupload = require('express-fileupload')
const ErrorResponse = require('./lib/error-response')

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
console.log('process.env.NODE_ENV', process.env.NODE_ENV)

const config = require('./config.json')
const configDefault = config.default
const configEnvironment = config[process.env.NODE_ENV]
global.__settings = { ...configDefault, ...configEnvironment }

global.__base = __dirname + '/'
global.__responder = new responder.module()

try {
  __settings.mongodb = process.env.mongodb
  __settings.mongodb = __settings.mongodb.replace(/xxx/g, 'drive')
  __settings.mongodb = JSON.parse(__settings.mongodb)

  __settings.auth.host = process.env.hostAuth

  __settings.auth.token = JSON.parse(process.env.BITID_TOKEN)
  __settings.auth.email = process.env.BITID_EMAIL

  console.log(JSON.stringify(__settings))
} catch (e) {
  console.error('ERROR APPLYING ENV VARIABLES', e)
}

try {
  const portal = {
    api: (args) => {
      const deferred = Q.defer()

      try {
        const app = express()
        app.use(cors())
        app.use(express.urlencoded({
          limit: '50mb',
          extended: true,
          parameterLimit: 50000
        }))
        app.use(express.json({
          limit: '50mb'
        }))
        app.use((req, res, next) => {
          req.authorization = {
            appId: [],
            userId: req.body?.header?.userId,
            groupId: []
          }
          next();
        })
        app.use(fileupload({
          limits: {
            fileSize: __settings.limit * 1024 * 1024
          },
          tempFileDir: __base + 'tmp/',
          useTempFiles: true,
          abortOnLimit: true
        }))

        if (__settings.authentication) {
          app.use((req, res, next) => {
            if (req.method !== 'GET' && req.method !== 'PUT') {
              if (req.path === '/drive/files/upload') {
                req.originalUrl = '/drive/files/upload'
                req.body = {
                  header: {
                    email: req.query.email,
                    appId: req.query.appId,
                    userId: req.query.userId
                  }
                }
              }
              auth.authenticate({
                req,
                res
              })
                .then(result => {
                  next()
                }, error => {
                  console.error(error)
                  __responder.error(req, res, error)
                })
            } else {
              next()
            }
          })
        }

        app.use('/drive/files', require('./api/files'))
        console.log('Loaded: /drive/files')

        app.use('/drive/config', require('./api/config'))
        console.log('Loaded: /drive/config')

        app.use('/health-check', require('@bitid/health-check'))
        console.log('Loaded: /health-check')

        app.use((error, req, res, next) => {
          const err = new ErrorResponse()
          err.error.code = 500
          err.error.message = 'Something broke'
          err.error.errors[0].code = 500
          err.error.errors[0].message = 'Something broke'
          __responder.error(req, res, err)
        })

        const server = http.createServer(app)
        server.listen(__settings.port)

        deferred.resolve(args)
      } catch (error) {
        deferred.reject(error)
        console.error(error)
      }

      return deferred.promise
    },

    init: () => {
      if (!__settings.production || !__settings.authentication) {
        let index = 0
        console.log('')
        console.log('=======================')
        console.log('')
        console.log(chalk.yellow('Warning: '))
        if (!__settings.production) {
          index++
          console.log('')
          console.log(chalk.yellow(index + ': You are running in ') + chalk.red('"Development Mode!"') + chalk.yellow(' This can cause issues if this environment is a production environment!'))
          console.log('')
          console.log(chalk.yellow('To enable production mode, set the ') + chalk.bold(chalk.green('production')) + chalk.yellow(' variable in the config to ') + chalk.bold(chalk.green('true')) + chalk.yellow('!'))
        }
        if (!__settings.authentication) {
          index++
          console.log('')
          console.log(chalk.yellow(index + ': Authentication is not enabled ') + chalk.yellow(' This can cause issues if this environment is a production environment!'))
          console.log('')
          console.log(chalk.yellow('To enable Authentication mode, set the ') + chalk.bold(chalk.green('authentication')) + chalk.yellow(' variable in the config to ') + chalk.bold(chalk.green('true')) + chalk.yellow('!'))
        }
        console.log('')
        console.log('=======================')
        console.log('')
      }

      portal.api()
        .then(portal.database, null)
        .then(() => {
          console.log('Webserver Running on port: ', __settings.port)
        }, err => {
          console.error('Error Initializing: ' + err)
        })
    },

    database: () => {
      const deferred = Q.defer()

      db.connect()
        .then(database => {
          global.__database = database
          deferred.resolve()
        }, err => {
          deferred.reject(err)
        })

      return deferred.promise
    }
  }

  portal.init()
} catch (error) {
  console.log('The following error has occurred: ', error.message)
}

exports.module = module
