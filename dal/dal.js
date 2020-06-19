var Q       	= require('q');
var db			= require('../db/mongo');
var tools 		= require('../lib/tools');
var ObjectId	= require('mongodb').ObjectId;

var module = function() {
	var dalFiles = {
		errorResponse: {
			"error": {
				"code": 	401,
				"message": 	"Invalid Credentials",
				"errors": [{
					"code": 		503,
					"reason": 		"General Error",
					"message": 		"General Error",
					"locaction": 	"dalFiles",
					"locationType": "header"
				}]
			},
			"hiddenErrors": []
		},

		get: (args) => {
			db.call({
				'params': {
					"_id": 				ObjectId(args.req.query.fileId),
					"metadata.token": 	args.req.query.token
				},
				'res': 			args.res,
				'operation': 	'getfile',
				'collection': 	'fs.files'
			});
		},

		list: (args) => {
			var deferred = Q.defer();
			
			var params = {
				"metadata.bitid.auth.users.email": args.req.body.header.email
			};

			var filter = {};
			if (typeof(args.req.body.filter) != "undefined") {
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
				'params': 		params,
				'filter': 		filter,
				'operation': 	'find',
				'collection': 	'fs.files'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalFiles.errorResponse.error.errors[0].code 	= err.code 			|| dalFiles.errorResponse.error.errors[0].code;
				dalFiles.errorResponse.error.errors[0].reason 	= err.description 	|| 'List Files Error';
				deferred.reject(dalFiles.errorResponse);
			});

			return deferred.promise;
		},

		share: (args) => {
			var deferred = Q.defer();

			var params = {
			    "metadata.bitid.auth.users.email": {
			    	$ne: args.req.body.email
		    	},
			    "metadata.bitid.auth.users": {
			        $elemMatch: {
			            "role": {
			                $gte: 4
			            },
			            "email": args.req.body.header.email
			        }
			    },
			    "_id": ObjectId(args.req.body.fileId)
			};
			var update = {
				$set: {
					"metadata.serverDate": 	new Date()
				},
				$push: {
					"metadata.bitid.auth.users": {
				        "role": 	args.req.body.role,
				        "email":	args.req.body.email
				    }
				}
			};

			db.call({
				'params': 		params,
				'update': 		update,
				'operation': 	'update',
				'collection': 	'fs.files'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalFiles.errorResponse.error.errors[0].code   = err.code 			|| dalFiles.errorResponse.error.errors[0].code;
				dalFiles.errorResponse.error.errors[0].reason = err.description 	|| 'Share User To Report Error';
				deferred.reject(dalFiles.errorResponse);
			});

			return deferred.promise;
		},

		upload: (args) => {
			var deferred = Q.defer();

			var file = args.req.files.uploads[0];
			var update = {
				'metadata.bitid': {
					'auth': {
						'users': [
							{
								'role':  5,
								'email': args.req.query.email
							}
						],
						'organizationOnly': 0
					}
				},
				'metadata.appId':		args.req.query.appId,
				'metadata.token':		tools.generateToken(32),
				'metadata.serverDate': 	new Date()
			};

			db.call({
				'file': 		file,
				'update':		update,
				'operation':	'upload',
				'collection':	'fs.files'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalFiles.errorResponse.error.errors[0].code   = err.code 			|| dalFiles.errorResponse.error.errors[0].code;
				dalFiles.errorResponse.error.errors[0].reason = err.description 	|| 'Upload File Error';
				deferred.reject(dalFiles.errorResponse);
			});

			return deferred.promise;
		},

		update: (args) => {
			var deferred = Q.defer();

			var params = {
				"metadata.bitid.auth.users": {
			        $elemMatch: {
			            "role": {
			                $gte: 2
			            },
			            "email": args.req.body.header.email
			        }
			    },
				"_id": ObjectId(args.req.body.fileId)
			};
			var update = {
				$set: {
					"metadata.serverDate": new Date()
				}
			};
			if (typeof(args.req.body.description) != "undefined") {
				update.$set["metadata.description"] = args.req.body.description;
			};
			if (typeof(args.req.body.organizationOnly) != "undefined") {
				update.$set["bitid.auth.organizationOnly"] = args.req.body.organizationOnly;
			};

			db.call({
				'params': 		params,
				'update': 		update,
				'operation': 	'update',
				'collection': 	'fs.files'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalFiles.errorResponse.error.errors[0].code   = err.code 			|| dalFiles.errorResponse.error.errors[0].code;
				dalFiles.errorResponse.error.errors[0].reason = err.description 	|| 'Update File Error';
				deferred.reject(dalFiles.errorResponse);
			});

			return deferred.promise;
		},

		delete: (args) => {
			var deferred = Q.defer();
			
			var params = {
				"metadata.bitid.auth.users": {
			        $elemMatch: {
			            "role": {
			                $gte: 5
			            },
			            "email": args.req.body.header.email
			        }
			    },
				"_id": ObjectId(args.req.body.fileId)
			};

			db.call({
				'params': 		params,
				'operation': 	'remove',
				'collection': 	'fs.files'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalFiles.errorResponse.error.errors[0].code   = err.code 			|| dalFiles.errorResponse.error.errors[0].code;
				dalFiles.errorResponse.error.errors[0].reason = err.description 	|| 'Delete File Error';
				deferred.reject(dalFiles.errorResponse);
			});

			return deferred.promise;
		},

		unsubscribe: (args) => {
			var deferred = Q.defer();

			var params = {
				"metadata.bitid.auth.users": {
			        $elemMatch: {
			            "role": {
			                $gte: 4
			            },
			            "email": args.req.body.header.email
			        }
			    },
			    "_id": ObjectId(args.req.body.fileId)
			};
			var update = {
				$set: {
					"metadata.serverDate": 	new Date()
				},
				$pull: {
					"metadata.bitid.auth.users": {
				        "email": args.req.body.email
				    }
				}
			};

			db.call({
				'params': 		params,
				'update': 		update,
				'operation': 	'update',
				'collection': 	'fs.files'
			})
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalFiles.errorResponse.error.errors[0].code   = err.code 			|| dalFiles.errorResponse.error.errors[0].code;
				dalFiles.errorResponse.error.errors[0].reason = err.description 	|| 'Unsubscribe Users From A File Error';
				deferred.reject(dalFiles.errorResponse);
			});

			return deferred.promise;
		},

		updatesubscriber: (args) => {
			var deferred = Q.defer();
			
			var params = {
				"metadata.bitid.auth.users": {
			        $elemMatch: {
			            "role": {
			                $gte: 4
			            },    
			            "email": args.req.body.header.email   
			        }
			    },
				"_id": ObjectId(args.req.body.fileId)	
			};
			
			db.call({
				'params': 		params,
				'operation': 	'find',
				'collection': 	'fs.files'
			})
			.then(result => {
				var deferred = Q.defer();

				var params = {
					"metadata.bitid.auth.users": {
				        $elemMatch: {
				            "email": args.req.body.email    
				        }
				    },
					"_id": ObjectId(args.req.body.fileId)	
				};
				var update = {
					$set: {
			            "metadata.bitid.auth.users.$.role": args.req.body.role
					}
				};

				deferred.resolve({
					'params': 		params,
					'update': 		update,
					'operation': 	'update',
					'collection': 	'fs.files'
				});

				return deferred.promise;
			}, null)
			.then(db.call, null)
			.then(result => {
				args.result = result;
				deferred.resolve(args);
			}, err => {
				dalFiles.errorResponse.error.errors[0].code 	= err.code 			|| dalFiles.errorResponse.error.errors[0].code;
				dalFiles.errorResponse.error.errors[0].reason 	= err.description 	|| 'Update File Subscriber Error';
				deferred.reject(dalFiles.errorResponse);
			});

			return deferred.promise;
		}
	};

	return {
		"files": dalFiles
	};
};

exports.module = module;