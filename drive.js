var Q           = require('q');
var db          = require('./db/mongo');
var cors        = require('cors');
var auth        = require('./lib/auth');
var http        = require('http');
var chalk       = require('chalk');
var logger      = require('./lib/logger');
var express     = require('express');
var responder   = require('./lib/responder');
var bodyParser  = require('body-parser');

global.__base       = __dirname + '/';
global.__logger     = new logger.module();
global.__settings   = require('./config.json');
global.__responder  = new responder.module();

try { 
    var portal = {
        errorResponse: {
            "error": {
                "code":     401,
                "message":  "Invalid Credentials",
                "errors":[{
                    "code":         401,
                    "reason":       "Drive Error",
                    "message":      "Invalid Credentials",
                    "locaction":    "portal",
                    "locationType": "header"
                }]
            },
            "hiddenErrors": []
        },

        api: (args) => {
            var deferred = Q.defer();

            try {
                var app  = express();
                app.use(cors());
                app.use(bodyParser.urlencoded({
                    'limit':          '50mb',
                    'extended':       true,
                    'parameterLimit': 50000
                }));
                app.use(bodyParser.json({
                    'limit': '50mb'
                }));

                if (args.settings.authentication) {
                    app.use((req, res, next) => {
                        if (req.method != 'GET' &&  req.method != 'PUT') {
                            if (req.path == "/drive/files/upload") {
                                req.originalUrl = "/drive/files/upload";
                                req.body = {
                                    "header": {
                                        "email": req.query.email,
                                        "appId": req.query.appId
                                    }
                                };
                            };
                            auth.authenticate({
                                'req': req,
                                'res': res
                            })
                            .then(result => {
                                next();
                            }, err => {
                                var error = {
                                    "error": err
                                };
                                error.error.code             = 401;
                                error.error.errors[0].code   = 401;
                                __responder.error(req, res, error);
                            });
                        } else {
                            next();
                        };
                    });
                };

                var files = require('./api/files');
                app.use('/drive/files', files);

                app.use((err, req, res, next) => {
                    portal.errorResponse.error.code               = 500;
                    portal.errorResponse.error.message            = 'Something broke';
                    portal.errorResponse.error.errors[0].code     = 500;
                    portal.errorResponse.error.errors[0].message  = 'Something broke';
                    portal.errorResponse.hiddenErrors.push(err.stack);
                    __responder.error(req, res, portal.errorResponse);
                });

                var server = http.createServer(app);
                server.listen(args.settings.localwebserver.port);

                deferred.resolve(args);
            } catch(e) {
                deferred.reject(e)
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
            }, err => {
                console.log('Error Initializing: ', err);
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
} catch(error) {
    console.log('The following error has occurred: ', error.message);
};

exports.module = module;