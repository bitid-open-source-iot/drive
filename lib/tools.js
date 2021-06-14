const Q = require('q');
const format = require('./format');
const Readable = require('stream').Readable;
const ErrorResponse = require('./error-response');

exports.setRoleList = (args) => {
    var deferred = Q.defer();

    try {
        args.result = args.result.map(o => {
            if (typeof (o.metadata) != 'undefined') {
                if (typeof (o.metadata.bitid) != 'undefined') {
                    if (typeof (o.metadata.bitid.auth) != 'undefined') {
                        if (typeof (o.metadata.bitid.auth.users) != 'undefined') {
                            o.role = 0;

                            o.metadata.bitid.auth.users.map(user => {
                                user.email = format.email(user.email)
                                if (user.email == format.email(args.req.body.header.email)) {
                                    o.role = user.role;
                                };
                            });
                        };
                    };
                };
            };
            return o;
        });

        if (typeof (args.req.body.filter) != 'undefined' && Array.isArray(args.req.body.filter)) {
            if (args.req.body.filter.indexOf('role') == -1) {
                args.result = args.result.map(o => {
                    delete o.role;
                    return o;
                });
            };
        };

        if (typeof (args.req.body.filter) != 'undefined') {
            if (args.req.body.filter.indexOf('users') == -1) {
                args.result = args.result.map(o => {
                    if (typeof (o.metadata) != 'undefined') {
                        if (typeof (o.metadata.bitid) != 'undefined') {
                            if (typeof (o.metadata.bitid.auth) != 'undefined') {
                                if (typeof (o.metadata.bitid.auth.users) != 'undefined') {
                                    delete o.metadata.bitid.auth.users;
                                };
                            };
                        };
                    };
                    return o;
                });
            };
        };

        deferred.resolve(args);
    } catch (error) {
        var err = new ErrorResponse();
        err.error.errors[0].code = 503;
        err.error.errors[0].reason = error.message;
        err.error.errors[0].message = error.message;
        deferred.resolve(err);
    };

    return deferred.promise;
};

exports.setRoleObject = (args) => {
    var deferred = Q.defer();

    try {
        if (typeof (args.result.metadata) != 'undefined') {
            if (typeof (args.result.metadata.bitid) != 'undefined') {
                if (typeof (args.result.metadata.bitid.auth) != 'undefined') {
                    if (typeof (args.result.metadata.bitid.auth.users) != 'undefined') {
                        args.result.role = 0;

                        args.result.metadata.bitid.auth.users.map(user => {
                            user.email = format.email(user.email)
                            if (user.email == format.email(args.req.body.header.email)) {
                                args.result.role = user.role;
                            };
                        });
                    };
                };
            };
        };

        if (typeof (args.req.body.filter) != 'undefined' && Array.isArray(args.req.body.filter)) {
            if (args.req.body.filter.indexOf('role') == -1) {
                delete args.result.role;
            };
        };

        if (typeof (args.req.body.filter) != 'undefined') {
            if (args.req.body.filter.indexOf('users') == -1) {
                if (typeof (args.result.metadata) != 'undefined') {
                    if (typeof (args.result.metadata.bitid) != 'undefined') {
                        if (typeof (args.result.metadata.bitid.auth) != 'undefined') {
                            if (typeof (args.result.metadata.bitid.auth.users) != 'undefined') {
                                delete args.result.metadata.bitid.auth.users;
                            };
                        };
                    };
                };
            };
        };

        deferred.resolve(args);
    } catch (error) {
        var err = new ErrorResponse();
        err.error.errors[0].code = 503;
        err.error.errors[0].reason = error.message;
        err.error.errors[0].message = error.message;
        deferred.resolve(err);
    };

    return deferred.promise;
};

exports.generateToken = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;

    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    };

    return result;
};

exports.bufferToStream = (binary) => {
    return new Readable({
        read() {
            this.push(binary);
            this.push(null);
        }
    });
}