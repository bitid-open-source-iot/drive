const Q = require('q');
const _ = require('lodash');
const sql = require('mssql');
const unwind = require('../lib/unwind');
const project = require('../lib/project');
const ErrorResponse = require('../lib/error-response');

var module = function () {
	var dalFiles = {
        add: (args) => {
            var deferred = Q.defer();

            var err = new ErrorResponse();
            const transaction = new sql.Transaction(__database);

            transaction.on('commit', result => {
                deferred.resolve(args);
            });

            transaction.on('rollback', aborted => {
                deferred.reject(err);
            });

            transaction.begin()
                .then(res => new sql.Request(transaction)
					.input('name', args.req.body.name)
					.input('data', args.req.body.data)
					.input('size', args.req.body.size)
					.input('appId', args.req.body.appId)
					.input('token', args.req.body.token)
					.input('userId', args.req.body.header.userId)
					.input('mimetype', args.req.body.mimetype)
					.input('organizationOnly', args.req.body.organizationOnly || 0)
					.execute('v1_Files_Add'), null)
                .then(result => {
                    var deferred = Q.defer();

                    if (result.returnValue == 1 && result.recordset.length > 0) {
                        args.result = result.recordset[0];
                        deferred.resolve(args);
                    } else {
                        err.error.errors[0].code = result.recordset[0].code;
                        err.error.errors[0].reason = result.recordset[0].message;
                        err.error.errors[0].message = result.recordset[0].message;
                        deferred.reject(err);
                    };

                    return deferred.promise;
                }, null)
				.then(res => args.req.body.users.reduce((promise, user) => promise.then(() => new sql.Request(transaction)
					.input('role', user.role)
					.input('appId', args.result._id)
					.input('userId', user.userId)
					.execute('v1_Apps_Add_User')
				), Promise.resolve()))
                .then(result => {
                    var deferred = Q.defer();

                    if (result.returnValue == 1 && result.recordset.length > 0) {
                        args.result = result.recordset[0];
                        deferred.resolve(args);
                    } else {
                        err.error.errors[0].code = result.recordset[0].code;
                        err.error.errors[0].reason = result.recordset[0].message;
                        err.error.errors[0].message = result.recordset[0].message;
                        deferred.reject(err);
                    };

                    return deferred.promise;
                }, null)
                .then(res => {
                    transaction.commit();
                })
                .catch(err => {
                    transaction.rollback();
                })

            return deferred.promise;
        },

		get: (args) => {
			var deferred = Q.defer();

			var filter = {};
			if (Array.isArray(args.req.body.filter) && args.req.body.filter.length > 0) {
				filter['id'] = 0;
				args.req.body.filter.map(f => {
					if (f == 'fileId') {
						filter['id'] = 1;
					} else {
						filter[f] = 1;
					};
				});
			};

			const request = new sql.Request(__database);

			request.input('token', args.req.body.token);
			request.input('fileId', args.req.body.fileId);
			request.input('userId', args.req.body.header.userId);

			request.execute('v1_Files_Get')
				.then(result => {
					if (result.returnValue == 1 && result.recordset.length > 0) {
						result = result.recordset.map(o => unwind(o));
						args.result = {
							bitid: {
								auth: {
									users: _.uniqBy(result, 'id').map(o => {
										return {
											role: o.role,
											userId: o.userId
										}
									}),
									organizationOnly: new Boolean(result[0].organizationOnly)
								}
							},
							name: result[0].name,
							data: result[0].data,
							size: result[0].size,
							appId: result[0].appId,
							token: result[0].token,
							userId: result[0].userId,
							mimetype: result[0].mimetype,
							serverDate: result[0].serverDate
						};
						args.result = project(args.result, filter);
						deferred.resolve(args);
					} else {
						var err = new ErrorResponse();
						err.error.errors[0].code = result.recordset[0].code;
						err.error.errors[0].reason = result.recordset[0].message;
						err.error.errors[0].message = result.recordset[0].message;
						deferred.reject(err);
					}
				})
				.catch(error => {
					var err = new ErrorResponse();
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.message;
					err.error.errors[0].message = error.message;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		list: (args) => {
			var deferred = Q.defer();

			var filter = {};
			if (Array.isArray(args.req.body.filter) && args.req.body.filter.length > 0) {
				filter['id'] = 0;
				args.req.body.filter.map(f => {
					if (f == 'fileId') {
						filter['id'] = 1;
					} else {
						filter[f] = 1;
					};
				});
			};

			const request = new sql.Request(__database);

			request.input('userId', args.req.body.header.userId);

			request.execute('v1_Files_List')
				.then(result => {
					if (result.returnValue == 1 && result.recordset.length > 0) {
						args.result = result.recordset.map(o => project(unwind(o), filter));
						deferred.resolve(args);
					} else {
						var err = new ErrorResponse();
						err.error.errors[0].code = result.recordset[0].code;
						err.error.errors[0].reason = result.recordset[0].message;
						err.error.errors[0].message = result.recordset[0].message;
						deferred.reject(err);
					}
				})
				.catch(error => {
					var err = new ErrorResponse();
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.message;
					err.error.errors[0].message = error.message;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		update: (args) => {
			var deferred = Q.defer();

			const request = new sql.Request(__database);

			request.input('name', args.req.body.name);
			request.input('data', args.req.body.data);
			request.input('size', args.req.body.size);
			request.input('appId', args.req.body.appId);
			request.input('token', args.req.body.token);
			request.input('fileId', args.req.body.fileId);
			request.input('userId', args.req.body.header.userId);
			request.input('mimetype', args.req.body.mimetype);
			request.input('organizationOnly', args.req.body.organizationOnly);

			request.execute('v1_Files_Update')
				.then(result => {
					if (result.returnValue == 1 && result.recordset.length > 0) {
						args.result = result.recordset[0];
						deferred.resolve(args);
					} else {
						var err = new ErrorResponse();
						err.error.errors[0].code = result.recordset[0].code;
						err.error.errors[0].reason = result.recordset[0].message;
						err.error.errors[0].message = result.recordset[0].message;
						deferred.reject(err);
					}
				})
				.catch(error => {
					var err = new ErrorResponse();
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.message;
					err.error.errors[0].message = error.message;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		delete: (args) => {
			var deferred = Q.defer();

			const request = new sql.Request(__database);

			request.input('fileId', args.req.body.fileId);
			request.input('userId', args.req.body.header.userId);

			request.execute('v1_Files_Delete')
				.then(result => {
					if (result.returnValue == 1 && result.recordset.length > 0) {
						args.result = result.recordset[0];
						deferred.resolve(args);
					} else {
						var err = new ErrorResponse();
						err.error.errors[0].code = result.recordset[0].code;
						err.error.errors[0].reason = result.recordset[0].message;
						err.error.errors[0].message = result.recordset[0].message;
						deferred.reject(err);
					}
				})
				.catch(error => {
					var err = new ErrorResponse();
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.message;
					err.error.errors[0].message = error.message;
					deferred.reject(err);
				});

			return deferred.promise;
		}
	};

	return {
		'files': dalFiles
	};
};

exports.module = module;