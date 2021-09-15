const Q = require('q');
const fs = require('fs');
const _ = require('lodash');
const sql = require('mssql');
const tools = require('../lib/tools');
const ErrorResponse = require('../lib/error-response');

var module = function () {
	var dalFiles = {
		add: (args) => {
			var deferred = Q.defer();

			fs.readFile(args.req.files['uploads[]'].tempFilePath, (err, data) => {
				if (err) {
					var err = new ErrorResponse();
					err.error.errors[0].code = 503;
					err.error.errors[0].reason = error.message;
					err.error.errors[0].message = error.message;
					deferred.reject(err);
				} else {
					const request = new sql.Request(__database);

					request.input('name', args.req.files['uploads[]'].name)
					request.input('data', data.toString('base64'))
					request.input('size', args.req.files['uploads[]'].size)
					request.input('appId', args.req.query.appId)
					request.input('token', tools.generateToken(32))
					request.input('userId', args.req.query.userId)
					request.input('mimetype', args.req.files['uploads[]'].mimetype)
					request.input('organizationOnly', args.req.query.organizationOnly || 0)

					request.execute('v1_Files_Add')
						.then(result => {
							fs.unlink(args.req.files['uploads[]'].tempFilePath, () => {
								if (result.returnValue == 1 && result.recordset.length > 0) {
									args.result = result.recordset[0];
									deferred.resolve(args);
								} else {
									var err = new ErrorResponse();
									err.error.errors[0].code = result.recordset[0].code;
									err.error.errors[0].reason = result.recordset[0].message;
									err.error.errors[0].message = result.recordset[0].message;
									deferred.reject(err);
								};
							});
						}, error => {
							fs.unlink(args.req.files['uploads[]'].tempFilePath, () => {
								var err = new ErrorResponse();
								err.error.errors[0].code = 503;
								err.error.errors[0].reason = error.message;
								err.error.errors[0].message = error.message;
								deferred.reject(err);
							});
						});
				};
			});

			return deferred.promise;
		},

		get: (args) => {
			var deferred = Q.defer();

			const request = new sql.Request(__database);

			request.input('token', args.req.body.token);
			request.input('fileId', args.req.body.fileId);

			request.execute('v1_Files_Get')
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

		zip: (args) => {
			var deferred = Q.defer();

			const table = new sql.Table();
			table.create = true;

			table.columns.add('token', sql.VarChar(32));
			table.columns.add('fileId', sql.Int);

			args.req.body.files.map(file => table.rows.add(file.token, file.fileId));

			const request = new sql.Request(__database);

			request.input('files', table);

			request.execute('v1_Files_Zip')
				.then(result => {
					if (result.returnValue == 1 && result.recordset.length > 0) {
						args.result = result.recordset.map(o => {
							o.data = Buffer.from(o.data, 'base64');
							return o;
						});
						deferred.resolve(args);
					} else {
						var err = new ErrorResponse();
						err.error.errors[0].code = result.recordset[0].code;
						err.error.errors[0].reason = result.recordset[0].message;
						err.error.errors[0].message = result.recordset[0].message;
						deferred.reject(err);
					};
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
						args.result = _.chain(result.recordset).groupBy('id').map((file, key) => {
							return {
								bitid: {
									auth: {
										users: _.uniqBy(file.map(o => ({ role: o.role, userId: o.userId })), 'userId'),
										organizationOnly: file[0].organizationOnly
									}
								},
								id: file[0].id,
								name: file[0].name,
								data: file[0].data,
								role: file[0].role,
								size: file[0].size,
								token: file[0].token,
								appId: file[0].appId,
								mimetype: file[0].mimetype,
								serverDate: file[0].serverDate
							}
						}).value();
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

		share: (args) => {
			var deferred = Q.defer();

			const request = new sql.Request(__database);

			request.input('role', args.req.body.role);
			request.input('fileId', args.req.body.fileId);
			request.input('userId', args.req.body.userId);
			request.input('adminId', args.req.body.header.userId);

			request.execute('v1_Files_Share')
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

		update: (args) => {
			var deferred = Q.defer();

			const request = new sql.Request(__database);

			request.input('name', args.req.body.name);
			request.input('appId', args.req.body.appId);
			request.input('fileId', args.req.body.fileId);
			request.input('userId', args.req.body.header.userId);
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
		},

		unsubscribe: (args) => {
			var deferred = Q.defer();

			const request = new sql.Request(__database);

			request.input('fileId', args.req.body.fileId);
			request.input('userId', args.req.body.userId);
			request.input('adminId', args.req.body.header.userId);

			request.execute('v1_Files_Unsubscribe')
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

		changeowner: (args) => {
			var deferred = Q.defer();

			const request = new sql.Request(__database);

			request.input('fileId', args.req.body.fileId);
			request.input('userId', args.req.body.userId);
			request.input('adminId', args.req.body.header.userId);

			request.execute('v1_Files_Change_Owner')
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

		updatesubscriber: (args) => {
			var deferred = Q.defer();

			const request = new sql.Request(__database);

			request.input('role', args.req.body.role);
			request.input('fileId', args.req.body.fileId);
			request.input('userId', args.req.body.userId);
			request.input('adminId', args.req.body.header.userId);

			request.execute('v1_Files_Update_Subscriber')
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