const Q = require('q');
const db = require('../db/mongo');
const tools = require('../lib/tools');
const format = require('../lib/format');
const ObjectId = require('mongodb').ObjectId;
const ErrorResponse = require('../lib/error-response');

var module = function () {
	var dalFiles = {
		get: (args) => {
			db.call({
				'params': {
					'_id': ObjectId(args.req.query.fileId),
					'metadata.token': args.req.query.token
				},
				'res': args.res,
				'operation': 'getfile',
				'collection': 'fs.files'
			});
		},

		list: (args) => {
			var deferred = Q.defer();

			var params = {
				'metadata.bitid.auth.users.email': format.email(args.req.body.header.email)
			};

			if (typeof (args.req.body.appId) != 'undefined' && args.req.body.appId != null) {
				if (Array.isArray(args.req.body.appId) && args.req.body.appId.length > 0) {
					params['metadata.appId'] = {
						$in: args.req.body.appId.filter(o => o.length == 24).map(o => o)
					};
				} else if (typeof (args.req.body.appId) == 'string' && args.req.body.appId.length == 24) {
					params['metadata.appId'] = args.req.body.appId;
				};
			};
			if (typeof (args.req.body.fileId) != 'undefined' && args.req.body.fileId != null) {
				if (Array.isArray(args.req.body.fileId) && args.req.body.fileId.length > 0) {
					params._id = {
						$in: args.req.body.fileId.filter(o => o.length == 24).map(o => ObjectId(o))
					};
				} else if (typeof (args.req.body.fileId) == 'string' && args.req.body.fileId.length == 24) {
					params._id = ObjectId(args.req.body.fileId);
				};
			};

			var filter = {};
			if (typeof (args.req.body.filter) != 'undefined') {
				filter._id = 0;
				args.req.body.filter.map(f => {
					if (f == 'fileId') {
						filter['_id'] = 1;
					} else if (f == 'aliases') {
						filter['aliases'] = 1;
					} else if (f == 'filename') {
						filter['filename'] = 1;
					} else if (f == 'uploadDate') {
						filter['uploadDate'] = 1;
					} else if (f == 'contentType') {
						filter['contentType'] = 1;
					} else if (f == 'role' || f == 'users') {
						filter['metadata.bitid.auth.users'] = 1;
					} else if (f == 'organizationOnly') {
						filter['metadata.bitid.auth.organizationOnly'] = 1;
					} else {
						filter['metadata.' + f] = 1;
					};
				});
			};

			db.call({
				'params': params,
				'filter': filter,
				'operation': 'find',
				'collection': 'fs.files'
			})
				.then(result => {
					args.result = result;
					deferred.resolve(args);
				}, error => {
					var err = new ErrorResponse()
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		share: (args) => {
			var deferred = Q.defer();

			var params = {
				'metadata.bitid.auth.users.email': {
					$ne: format.email(args.req.body.email)
				},
				'metadata.bitid.auth.users': {
					$elemMatch: {
						'role': {
							$gte: 4
						},
						'email': format.email(args.req.body.header.email)
					}
				},
				'_id': ObjectId(args.req.body.fileId)
			};
			var update = {
				$set: {
					'metadata.serverDate': new Date()
				},
				$push: {
					'metadata.bitid.auth.users': {
						'role': args.req.body.role,
						'email': format.email(args.req.body.email)
					}
				}
			};

			db.call({
				'params': params,
				'update': update,
				'operation': 'update',
				'collection': 'fs.files'
			})
				.then(result => {
					args.result = result;
					deferred.resolve(args);
				}, error => {
					var err = new ErrorResponse()
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		upload: (args) => {
			var deferred = Q.defer();

			var file = args.req.files['uploads[]'];
			var update = {
				'metadata.bitid': {
					'auth': {
						'users': [
							{
								'role': 5,
								'email': format.email(args.req.query.email)
							}
						],
						'organizationOnly': 0
					}
				},
				'metadata.appId': args.req.query.appId,
				'metadata.token': tools.generateToken(32),
				'metadata.serverDate': new Date()
			};

			db.call({
				'file': file,
				'update': update,
				'operation': 'upload',
				'collection': 'fs.files'
			})
				.then(result => {
					args.result = result;
					deferred.resolve(args);
				}, error => {
					var err = new ErrorResponse()
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		update: (args) => {
			var deferred = Q.defer();

			var params = {
				'metadata.bitid.auth.users': {
					$elemMatch: {
						'role': {
							$gte: 2
						},
						'email': format.email(args.req.body.header.email)
					}
				},
				'_id': ObjectId(args.req.body.fileId)
			};
			var update = {
				$set: {
					'metadata.serverDate': new Date()
				}
			};
			if (Array.isArray(args.req.body.aliases)) {
				update.$set.aliases = args.req.body.aliases;
			};
			if (typeof (args.req.body.appId) != 'undefined' && args.req.body.appId != null) {
				update.$set['metadata.appId'] = args.req.body.appId;
			};
			if (typeof (args.req.body.token) != 'undefined' && args.req.body.token != null) {
				update.$set['metadata.token'] = args.req.body.token;
			};
			if (typeof (args.req.body.filename) != 'undefined' && args.req.body.filename != null) {
				update.$set.filename = args.req.body.filename;
			};
			if (typeof (args.req.body.organizationOnly) != 'undefined' && args.req.body.organizationOnly != null) {
				update.$set['metadata.bitid.auth.organizationOnly'] = args.req.body.organizationOnly;
			};

			db.call({
				'params': params,
				'update': update,
				'operation': 'update',
				'collection': 'fs.files'
			})
				.then(result => {
					args.result = result;
					deferred.resolve(args);
				}, error => {
					var err = new ErrorResponse()
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		delete: (args) => {
			var deferred = Q.defer();

			var params = {
				'metadata.bitid.auth.users': {
					$elemMatch: {
						'role': {
							$gte: 5
						},
						'email': format.email(args.req.body.header.email)
					}
				},
				'_id': ObjectId(args.req.body.fileId)
			};

			db.call({
				'params': params,
				'operation': 'remove',
				'collection': 'fs.files'
			})
				.then(result => {
					var deferred = Q.defer();

					args.result = result;

					var params = {
						'files_id': ObjectId(args.req.body.fileId)
					}

					deferred.resolve({
						'params': params,
						'operation': 'remove',
						'collection': 'fs.chunks'
					});

					return deferred.promise;
				}, null)
				.then(db.call, null)
				.then(result => {
					deferred.resolve(args);
				}, error => {
					var err = new ErrorResponse()
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		unsubscribe: (args) => {
			var deferred = Q.defer();

			var params = {
				'metadata.bitid.auth.users': {
					$elemMatch: {
						'role': {
							$gte: 4
						},
						'email': format.email(args.req.body.header.email)
					}
				},
				'_id': ObjectId(args.req.body.fileId)
			};
			var update = {
				$set: {
					'metadata.serverDate': new Date()
				},
				$pull: {
					'metadata.bitid.auth.users': {
						'email': format.email(args.req.body.email)
					}
				}
			};

			db.call({
				'params': params,
				'update': update,
				'operation': 'update',
				'collection': 'fs.files'
			})
				.then(result => {
					args.result = result;
					deferred.resolve(args);
				}, error => {
					var err = new ErrorResponse()
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
					deferred.reject(err);
				});

			return deferred.promise;
		},

		updatesubscriber: (args) => {
			var deferred = Q.defer();

			var params = {
				'metadata.bitid.auth.users': {
					$elemMatch: {
						'role': {
							$gte: 4
						},
						'email': format.email(args.req.body.header.email)
					}
				},
				'_id': ObjectId(args.req.body.fileId)
			};

			db.call({
				'params': params,
				'operation': 'find',
				'collection': 'fs.files'
			})
				.then(result => {
					var deferred = Q.defer();

					var params = {
						'metadata.bitid.auth.users': {
							$elemMatch: {
								'email': format.email(args.req.body.email)
							}
						},
						'_id': ObjectId(args.req.body.fileId)
					};
					var update = {
						$set: {
							'metadata.bitid.auth.users.$.role': args.req.body.role
						}
					};

					deferred.resolve({
						'params': params,
						'update': update,
						'operation': 'update',
						'collection': 'fs.files'
					});

					return deferred.promise;
				}, null)
				.then(db.call, null)
				.then(result => {
					args.result = result;
					deferred.resolve(args);
				}, error => {
					var err = new ErrorResponse()
					err.error.errors[0].code = error.code;
					err.error.errors[0].reason = error.description;
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