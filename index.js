const Q = require('q');
const db = require('./db/sql');
const cors = require('cors');
const auth = require('./lib/auth');
const http = require('http');
const chalk = require('chalk');
const express = require('express');
const responder = require('./lib/responder');
const fileupload = require('express-fileupload');
const healthcheck = require('@bitid/health-check');
const ErrorResponse = require('./lib/error-response');

global.__base = __dirname + '/';
global.__logger = require('./lib/logger');
global.__settings = require('./config.json');
global.__responder = new responder.module();

__logger.init();

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

                if (args.settings.authentication) {
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
                server.listen(args.settings.localwebserver.port);

                deferred.resolve(args);
            } catch (error) {
                deferred.reject(error);
                __logger.error(error);
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
                    __logger.info('Webserver Running on port: ' + args.settings.localwebserver.port);
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

    portal.init({
        'settings': __settings
    });
} catch (error) {
    console.log('The following error has occurred: ', error.message);
};

exports.module = module;