const Q = require('q');
const fs = require('fs');
const tools = require('./tools');
const ErrorResponse = require('./error-response');

var module = function () {
	var responder = {
		response: {
			update: (result) => {
				var deferred = Q.defer();

				deferred.resolve({
					'updated': result.n
				});

				return deferred.promise;
			},

			delete: (result) => {
				var deferred = Q.defer();

				deferred.resolve({
					'deleted': result.n
				});

				return deferred.promise;
			},

			zips: {
				add: (result) => {
					var deferred = Q.defer();

					deferred.resolve({
						'token': result.token,
						'zipId': result.id
					});

					return deferred.promise;
				}
			},

			files: {
				add: (result) => {
					var deferred = Q.defer();

					deferred.resolve({
						'token': result.token,
						'fileId': result.id
					});

					return deferred.promise;
				},

				get: (result) => {
					var deferred = Q.defer();

					deferred.resolve(result);

					return deferred.promise;
				},

				list: (result) => {
					var deferred = Q.defer();

					result = result.map(obj => {
						var tmp = {
							'role': obj.role,
							'name': obj.name,
							'data': obj.data,
							'size': obj.size,
							'appId': obj.appId,
							'token': obj.token,
							'fileId': obj.id,
							'mimetype': obj.mimetype,
							'serverDate': obj.serverDate,
						};

						if (typeof (obj.bitid) != 'undefined' && obj.bitid != null) {
							if (typeof (obj.bitid.auth) != 'undefined' && obj.bitid.auth != null) {
								tmp.users = obj.bitid.auth.users;
								tmp.organizationOnly = obj.bitid.auth.organizationOnly;
							};
						};

						return tmp;
					});

					deferred.resolve(result);

					return deferred.promise;
				}
			}
		},

		model: (req, result) => {
			var deferred = Q.defer();

			switch (req.originalUrl) {
				case ('*'):
					deferred.resolve(result);
					break;

				case ('/drive/zips/add'):
					responder.response.zips.add(result).then(deferred.resolve, deferred.reject);
					break;
				case ('/drive/files/add'):
					responder.response.files.add(result).then(deferred.resolve, deferred.reject);
					break;
				case ('/drive/files/get'):
					responder.response.files.get(result).then(deferred.resolve, deferred.reject);
					break;
				case ('/drive/files/list'):
					responder.response.files.list(result).then(deferred.resolve, deferred.reject);
					break;

				case ('/drive/files/share'):
				case ('/drive/files/update'):
				case ('/drive/files/unsubscribe'):
				case ('/drive/files/change-owner'):
				case ('/drive/files/update-subscriber'):
					responder.response.update(result).then(deferred.resolve, deferred.reject);
					break;

				case ('/drive/zips/delete'):
				case ('/drive/files/delete'):
					responder.response.delete(result).then(deferred.resolve, deferred.reject);
					break;

				default:
					deferred.resolve({
						'success': {
							'details': 'your request resolved successfully but this payload is not modeled'
						}
					});
					break;
			};

			return deferred.promise;
		},

		error: (req, res, err) => {
			res.status(err.error.code).json(err.error);
		},

		success: (req, res, result) => {
			responder.model(req, result)
				.then(result => {
					if (req.method != 'GET') {
						res.json(result);
					} else {
						// var file = [__base, '/tmp/', tools.generateToken(32), '-', result.name].join('');
						var file = [__base, 'tmp/', tools.generateToken(32), '-', result.name].join('');
						fs.writeFile(file, result.data, 'base64', function (err) {
							if (err) {
								var error = new ErrorResponse();
								error.error.code = 503;
								error.error.message = 'Issue in responder';
								error.error.errors[0].code = 503;
								error.error.errors[0].reason = err.message;
								error.error.errors[0].message = err.message;
								responder.error(req, res, error);
							} else {
								try {
									res.setHeader('Content-Type', result.mimetype);
									res.setHeader('Content-Disposition', 'attachment;filename*=UTF-8\'\'' + result.name);
									var stream = fs.createReadStream(file);
									stream.on('open', function () {
										stream.pipe(res);
									});
									stream.on('error', function (err) {
										res.end(err);
									});
									fs.unlink(file, () => {})
								} catch (error) {
									console.log(error.message)
								};
							};
						});
					};
				}, error => {
					var err = new ErrorResponse();
					err.error.code = 503;
					err.error.message = 'Issue in responder';
					err.error.errors[0].code = 503;
					err.error.errors[0].reason = error.message;
					err.error.errors[0].message = error.message;
					responder.error(req, res, err);
				});
		}
	};

	return responder;
};

exports.module = module;