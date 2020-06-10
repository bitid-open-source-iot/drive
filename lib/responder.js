var Q = require('q');

var module = function() {
	var responder = {
		errorResponse: {
			"error": {
				"code": 	401,
				"message": 	"Error",
				"errors":[{
					"code": 		401,
					"reason": 		"generalError",
					"message": 		"error in Responder",
					"locaction": 	"Responder",
					"locationType": "db"
				}]
			}
		},

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

			files: {
				list: (result) => {
					var deferred = Q.defer();
					
					result = result.map(obj => {
						obj.fileId = obj._id;
						delete obj._id;
						delete obj.md5;
						delete obj.length;
        				delete obj.chunkSize;

						if (typeof(obj.metadata) != "undefined") {
							if (typeof(obj.metadata.bitid) != "undefined") {
								if (typeof(obj.metadata.bitid.auth) != "undefined") {
									obj.users 				= obj.metadata.bitid.auth.users;
									obj.organizationOnly 	= obj.metadata.bitid.auth.organizationOnly;
									delete obj.metadata.bitid;
								};
							};
							Object.keys(obj.metadata).map(key => {
								obj[key] = obj.metadata[key];
							});
							delete obj.metadata;
						};

						return obj;
					});
					
					deferred.resolve(result);
					
					return deferred.promise;
				},

				upload: (result) => {
					var deferred = Q.defer();
					
					deferred.resolve({
						'token':  result.token,
						'fileId': result._id
					});
					
					return deferred.promise;
				}
			}
		},

		model: (req, result) => {
			var deferred = Q.defer();

			switch(req.originalUrl) {
				case('*'):
					deferred.resolve(result);
					break;
				
				case('/drive/files/list'):
					responder.response.files.list(result).then(deferred.resolve, deferred.reject);
					break;
				
				case('/drive/files/upload'):
					responder.response.files.upload(result).then(deferred.resolve, deferred.reject);
					break;
				
				case('/drive/files/share'):
				case('/drive/files/update'):
				case('/drive/files/unsubscribe'):
				case('/drive/files/updatesubscriber'):
					responder.response.update(result).then(deferred.resolve, deferred.reject);
					break;
				
				case('/drive/files/delete'):
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
			if (typeof err == 'object') {
				try {
				} catch (e) {
				};
			} else {
			};
			
			res.status(err.error.code).json(err.error);
		},

		success: (req, res, result) => {
			responder.model(req,result)
			.then(result => {
				if (typeof result[0] !== 'undefined') {
					if (typeof result[0].error !== 'undefined') {
						if (result[0].error == 'No records found') {
							responder.errorResponse.error.code 	= 401;
							responder.errorResponse.error.message = 'No records found1';
						};
						responder.error(req, res, responder.errorResponse);
						return;				
					};
				};
				res.json(result);
			}, err => {
				responder.errorResponse.error.code 	= 401;
				responder.errorResponse.error.message = err;
				responder.error(req, res, responder.errorResponse);
			});
		}
	};

	return responder;
};
exports.module = module;