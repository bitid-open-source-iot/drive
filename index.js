const Q = require('q');
const db = require('./db/mongo');
const cors = require('cors');
const auth = require('./lib/auth');
const http = require('http');
const chalk = require('chalk');
const express = require('express');
const responder = require('./lib/responder');
const fileupload = require('express-fileupload');
const healthcheck = require('@bitid/health-check');
const ErrorResponse = require('./lib/error-response');

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log('process.env.NODE_ENV', process.env.NODE_ENV);

let config = require('./config.json');
let configDefault = config.default
let configEnvironment = config[process.env.NODE_ENV]
global.__settings = {...configDefault, ...configEnvironment}


global.__base = __dirname + '/';
global.__responder = new responder.module();

try{
    __settings.mongodb = process.env.mongodb
    __settings.mongodb = __settings.mongodb.replace(/xxx/g, 'drive')
    __settings.mongodb = JSON.parse(__settings.mongodb)

    __settings.auth.token = JSON.parse(process.env.BITID_TOKEN)
    __settings.auth.email = process.env.BITID_EMAIL

    /**TODO SMTP */

    console.log(JSON.stringify(__settings))

}catch(e){
    console.error('ERROR APPLYING ENV VARIABLES', e)
}



try {
    var portal = {
        api: (args) => {
            var deferred = Q.defer();

            try {
                var app = express();
                app.use(cors());
                app.use(express.urlencoded({
                    'limit': '50mb',
                    'extended': true,
                    'parameterLimit': 50000
                }));
                app.use(express.json({
                    'limit': '50mb'
                }));
                app.use(fileupload({
                    limits: {
                        fileSize: __settings.limit * 1024 * 1024
                    },
                    tempFileDir: __base + 'tmp/',
                    useTempFiles: true,
                    abortOnLimit: true
                }));

                console.log(__settings.limit * 1024 * 1024);

                if (args.settings.authentication) {
                    app.use((req, res, next) => {
                        if (req.method != 'GET' && req.method != 'PUT') {
                            if (req.path == '/drive/files/upload') {
                                req.originalUrl = '/drive/files/upload';
                                req.body = {
                                    'header': {
                                        'email': req.query.email,
                                        'appId': req.query.appId
                                    }
                                };
                            };
                            auth.authenticate({
                                'req': req,
                                'res': res
                            })
                                .then(result => {
                                    next();
                                }, error => {
                                    console.error(error);
                                    __responder.error(req, res, error);
                                });
                        } else {
                            next();
                        };
                    });
                };

                var files = require('./api/files');
                app.use('/drive/files', files);
                console.log('Loaded: /drive/files');

                app.use('/health-check', healthcheck);
                console.log('Loaded: /health-check');

                app.use((error, req, res, next) => {
                    var err = new ErrorResponse();
                    err.error.code = 500;
                    err.error.message = 'Something broke';
                    err.error.errors[0].code = 500;
                    err.error.errors[0].message = 'Something broke';
                    __responder.error(req, res, err);
                });

                var server = http.createServer(app);
                server.listen(args.settings.localwebserver.port);

                deferred.resolve(args);
            } catch (error) {
                deferred.reject(error);
                console.error(error);
            };

            return deferred.promise;
        },

        init: (args) => {
            if (!args.settings.production || !args.settings.authentication) {
                var index = 0;
                console.log('');
                console.log('=======================');
                console.log('');
                console.log(chalk.yellow('Warning: '));
                if (!args.settings.production) {
                    index++;
                    console.log('');
                    console.log(chalk.yellow(index + ': You are running in ') + chalk.red('"Development Mode!"') + chalk.yellow(' This can cause issues if this environment is a production environment!'));
                    console.log('');
                    console.log(chalk.yellow('To enable production mode, set the ') + chalk.bold(chalk.green('production')) + chalk.yellow(' variable in the config to ') + chalk.bold(chalk.green('true')) + chalk.yellow('!'));
                };
                if (!args.settings.authentication) {
                    index++;
                    console.log('');
                    console.log(chalk.yellow(index + ': Authentication is not enabled ') + chalk.yellow(' This can cause issues if this environment is a production environment!'));
                    console.log('');
                    console.log(chalk.yellow('To enable Authentication mode, set the ') + chalk.bold(chalk.green('authentication')) + chalk.yellow(' variable in the config to ') + chalk.bold(chalk.green('true')) + chalk.yellow('!'));
                };
                console.log('');
                console.log('=======================');
                console.log('');
            };

            portal.api(args)
                .then(portal.database, null)
                .then(args => {
                    console.log('Webserver Running on port: ', args.settings.localwebserver.port);
                    console.log('Webserver Running on port: ' + args.settings.localwebserver.port);
                }, err => {
                    console.log('Error Initializing: ', err);
                    console.error('Error Initializing: ' + err);
                });
        },

        database: (args) => {
            var deferred = Q.defer();

            db.connect()
                .then(database => {
                    global.__database = database;
                    deferred.resolve(args);
                }, err => {
                    deferred.reject(err);
                });

            return deferred.promise;
        }
    };

    portal.init({
        'settings': __settings
    });
} catch (error) {
    console.log('The following error has occurred: ', error.message);
};

exports.module = module;