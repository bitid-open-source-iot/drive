var Q		= require('q');
var fs		= require('fs');
var Grid    = require('gridfs-stream');
var mongo	= require('mongodb');
/* The code below is to fix the Grid Cursor, see https://github.com/aheckmann/gridfs-stream/issues/125 for reference */
eval(`Grid.prototype.findOne = ${Grid.prototype.findOne.toString().replace('nextObject', 'next')}`);

exports.call = (args) => {
	var deferred = Q.defer();

	var db 			= __database;
	var collection 	= db.collection(args.collection);

	switch(args.operation) {
		case('find'):
			args.skip 	= args.skip		|| 0;
			args.sort 	= args.sort		|| {'_id': -1};
			args.limit 	= args.limit	|| 1000000;
			args.filter = args.filter	|| {};
			
			collection.find(args.params).project(args.filter).skip(args.skip).sort(args.sort).limit(args.limit).toArray((err, result) => {
				if (typeof(result) == 'undefined') {
					deferred.reject({
						'code': 		71,
						'description': 'result undefined'
					});
				} else if (err) {
					deferred.reject({
						'code': 		72,
						'description': 'find error'
					});
				} else {
					if (result.length > 0) {
						deferred.resolve(result)
					} else {
						if (args.allowNoRecordsFound) {
							deferred.resolve([]);
						} else {
							deferred.reject({
								'code': 		69,
								'description': 'no records found'
							});
						};
					};
				};
			});
			break;
		case('insert'):
			collection.insertOne(args.params, (err, result) => {
				if (err) {
					if (err.code = '11000') {
						deferred.reject({
							'code': 		70,
							'description': 	'already exists'
						});
					} else {
						deferred.reject(err);
					};
				} else {
					if (typeof(result) !== 'undefined') {
						if (result.result.ok == 1) {
							deferred.resolve(result.ops);
						} else {
							deferred.reject({
								'code': 		70,
								'description': 	'error inserting'
							});
						};
					} else {
						deferred.reject({
							'code': 		70,
							'description': 	'error inserting'
						});
					};
				};
			});
			break;
		case('remove'):
			collection.removeOne(args.params, (err, result) => {
				if (err) {
					deferred.reject(err);
				} else {
					if (typeof(result) !== 'undefined') {
						if (result.result.ok == 1) {
							deferred.resolve(result.result);
						} else {
							deferred.reject({
								'code': 		70,
								'description': 	'error removing'
							});
						};
					} else {
						deferred.reject({
							'code': 		70,
							'description': 	'error removing'
						});
					};
				};
			});
			break;
		case('update'):
			collection.updateOne(args.params, args.update, (err, result) => {
				if (err) {
					deferred.reject(err);
				} else {
					if (typeof(result) !== 'undefined') {
						if (result.result.ok == 1) {
							deferred.resolve(result.result);
						} else {
							deferred.reject({
								'code': 		70,
								'description': 	'error updating'
							});
						};
					} else {
						deferred.reject({
							'code': 		70,
							'description': 	'error updating'
						});
					};
				};
			});
			break;
		case('upload'):
			var gfs = new Grid(db, mongo);

			var writestream = gfs.createWriteStream({
				'metadata':     args.file,
				'filename':     args.file.name,
				'content_type': args.file.type
			});

			fs.createReadStream(args.file.path).pipe(writestream);

			writestream.on('close', (file) => {
				fs.unlink(args.file.path, () => {
					collection.updateOne({
						'_id': file._id
					}, {
						$set: args.update
					}, (err, result) => {
						deferred.resolve({
							'_id': 		file._id,
							'token':   	args.update['metadata.token']
						});
					});
				});
			});
			break;
		case('getfile'):
			var gfs = new Grid(db, mongo);
			gfs.findOne(args.params, (err, file) => {
				if (err) {
					args.res.status(401).json({
						'code':     503,
						'message':  'Unknown Error Occured'
					});
				} else if (!file) {
					args.res.status(401).json({
						'code':     401,
						'message':  'Invalid Credentials'
					});
				} else {
					args.res.setHeader('Content-Type', file.contentType);
					var readstream = gfs.createReadStream(args.params);
					readstream.pipe(args.res);
				};
			});
			break;
		case('aggregate'):
			collection.aggregate(args.params).toArray((err, result) => {
				if (err) {
					deferred.reject(err);
				} else if (result.length > 0) {
					deferred.resolve(result);
				} else {
					if (args.allowNoRecordsFound) {
						deferred.resolve([]);
					} else {
						deferred.reject({
							'code': 		69,
							'description': 'no records found'
						});
					};
				};
			});
			break;
		case('updateMany'):
			collection.updateMany(args.params, args.update, (err, result) => {
				if (err) {
					deferred.reject(err);
				} else {
					if (typeof(result) !== 'undefined') {
						if (result.result.ok == 1) {
							deferred.resolve(result.result);
						} else {
							deferred.reject({
								'code': 		70,
								'description': 	'error updating'
							});
						};
					} else {
						deferred.reject({
							'code': 		70,
							'description': 	'error updating'
						});
					};
				};
			});
			break;
		case('bulkWrite'):
			collection.bulkWrite(args.params, (err, result) => {
				if (err) {
					deferred.reject(err);
				} else {
					if (typeof(result) !== 'undefined') {
						if (result.result.ok == 1) {
							deferred.resolve(result.result);
						} else {
							deferred.reject({
								'code': 		70,
								'description': 	'error updating'
							});
						};
					} else {
						deferred.reject({
							'code': 		70,
							'description': 	'error updating'
						});
					};
				};
			});
			break;
		default:
			deferred.reject({
				'code': 		503,
				'description': 'db query error'
			});
			break;
	};

	return deferred.promise;
};

exports.connect = () => {
	var deferred = Q.defer();

	mongo.connect(__settings.mongodb.url, {
		"poolSize": 			500,
		"useUnifiedTopology": 	true
	}, (error, connection) => {
		if (error) {
			deferred.reject({
				'code': 		600,
				'description': 	'Error Connecting To Database'
			});
		} else {
			var database = connection.db(__settings.mongodb.database);
			deferred.resolve(database);
		};
	});

	return deferred.promise;
};