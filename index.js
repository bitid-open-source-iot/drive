const Q = require('q');
const db = require('./db/sql');
const cors = require('cors');
const auth = require('./lib/auth');
const path = require('path')
const http = require('http');
const chalk = require('chalk');
const dotenv = require('dotenv');
const config = require('./config.json');
const express = require('express');
const responder = require('./lib/responder');
const fileupload = require('express-fileupload');
const healthcheck = require('@bitid/health-check');
const ErrorResponse = require('./lib/error-response');

dotenv.config({
    path: path.resolve(__dirname, '.env')
});

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

let configDefault = config.default;
let configEnvironment = config[process.env.NODE_ENV]

global.__base = __dirname + '/';
global.__logger = require('./lib/logger');
global.__settings = {
    ...configDefault,
    ...configEnvironment
}
global.__responder = new responder.module();

__logger.init();

try {
    __settings.mssql = process.env.MSSQL;
    __settings.mongodb = process.env.mongodb;
    __settings.mongodb = __settings.mongodb.replace(/xxx/g, 'drive');
    __settings.mongodb = JSON.parse(__settings.mongodb);
    __settings.auth.host = process.env.hostAuth;
    __settings.auth.appId = process.env.hostAuthAppId;
    __settings.auth.token = JSON.parse(process.env.BITID_TOKEN);
    __settings.auth.email = process.env.BITID_EMAIL;
    console.log(JSON.stringify(__settings));
} catch (e) {
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
                    useTempFiles: true
                }));

                if (__settings.authentication) {
                    app.use((req, res, next) => {
                        if (req.method != 'GET' && req.method != 'PUT') {
                            if (req.path == '/drive/files/add') {
                                req.originalUrl = '/drive/files/add';
                                req.body = {
                                    'header': {
                                        'appId': req.query.appId,
                                        'userId': req.query.userId
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
                                    __logger.error(error);
                                    __responder.error(req, res, error);
                                });
                        } else {
                            next();
                        };
                    });
                };

                var files = require('./api/files');
                app.use('/drive/files', files);
                __logger.info('Loaded: /drive/files');

                app.use('/health-check', healthcheck);
                __logger.info('Loaded: /health-check');

                app.use((error, req, res, next) => {
                    var err = new ErrorResponse();
                    err.error.code = 500;
                    err.error.message = 'Something broke';
                    err.error.errors[0].code = 500;
                    err.error.errors[0].message = 'Something broke';
                    __responder.error(req, res, err);
                });

                var server = http.createServer(app);
                server.listen(__settings.localwebserver.port);

                deferred.resolve();
            } catch (error) {
                deferred.reject(error);
                __logger.error(error);
            };

            return deferred.promise;
        },

        init: () => {
            if (!__settings.production || !__settings.authentication) {
                var index = 0;
                console.log('');
                console.log('=======================');
                console.log('');
                console.log(chalk.yellow('Warning: '));
                if (!__settings.production) {
                    index++;
                    console.log('');
                    console.log(chalk.yellow(index + ': You are running in ') + chalk.red('"Development Mode!"') + chalk.yellow(' This can cause issues if this environment is a production environment!'));
                    console.log('');
                    console.log(chalk.yellow('To enable production mode, set the ') + chalk.bold(chalk.green('production')) + chalk.yellow(' variable in the config to ') + chalk.bold(chalk.green('true')) + chalk.yellow('!'));
                };
                if (!__settings.authentication) {
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

            portal.api()
                .then(portal.database, null)
                .then(() => {
                    console.log('Webserver Running on port: ', __settings.localwebserver.port);
                    __logger.info('Webserver Running on port: ' + __settings.localwebserver.port);
                }, err => {
                    console.log('Error Initializing: ', err);
                    __logger.error('Error Initializing: ' + err);
                });
        },

        database: () => {
            var deferred = Q.defer();

            db.connect()
                .then(database => {
                    global.__database = database;
                    setInterval(() => {
                        if (!__database.connected) {
                            portal.database();
                        };
                    }, 5000)
                    deferred.resolve();
                })
                .catch(err => {
                    __logger.error('Database Connection Error: ' + err);
                    deferred.reject(err);
                    setTimeout(() => portal.database(), 5000);
                });

            return deferred.promise;
        }
    };

    portal.init();
} catch (error) {
    console.log('The following error has occurred: ', error.message);
};

exports.module = module;