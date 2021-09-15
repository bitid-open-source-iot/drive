const Q = require('q');
const fs = require('fs');
const os = require('os');
const Zip = require('adm-zip');
const dal = require('../dal/dal');
const tools = require('../lib/tools');

var module = function () {
	var bllZips = {
		add: (req, res) => {
			var args = {
				'req': req,
				'res': res
			};

			var myModule = new dal.module();
			myModule.zips.add(args)
				.then(args => {
					__responder.success(req, res, args.result);
				}, err => {
					__responder.error(req, res, err);
				});
		},

		get: (req, res) => {
			var args = {
				'req': req,
				'res': res
			};

			args.req.body = args.req.query;

			var myModule = new dal.module();
			myModule.zips.get(args)
				.then(async args => {
					var deferred = Q.defer();

					try {
						const zip = new Zip();

						args.result.map(file => zip.addFile(file.name, file.data));

						args.filename = [os.tmpdir(), '/', tools.generateToken(32), '.zip'].join('');

						await zip.writeZip(args.filename, err => {
							if (err) {
								throw err;
							};
						});
						var stream = fs.createReadStream(args.filename);

						args.res.setHeader('Content-Type', 'application/zip');
						args.res.setHeader('Content-Disposition', 'attachment;filename*=UTF-8\'\'' + args.filename.replace(os.tmpdir() + '/', ''));

						stream.on('open', () => {
							stream.pipe(args.res);
						});
						stream.on('error', (err) => {
							args.res.end(err);
							throw err;
						});
						fs.unlink(args.filename, () => {
							deferred.resolve(args);
						});
					} catch (error) {
						deferred.reject(error);
					};

					return deferred.promise;
				})
				.then(null, err => {
					__responder.error(req, res, err);
				});
		},

		delete: (req, res) => {
			var args = {
				'req': req,
				'res': res
			};

			var myModule = new dal.module();
			myModule.zips.delete(args)
				.then(args => {
					__responder.success(req, res, args.result);
				}, err => {
					__responder.error(req, res, err);
				});
		}
	};

	var bllFiles = {
		add: (req, res) => {
			req.originalUrl = req.originalUrl.split('?')[0];

			var args = {
				'req': req,
				'res': res
			};

			var myModule = new dal.module();
			myModule.files.add(args)
				.then(args => {
					__responder.success(req, res, args.result);
				}, err => {
					__responder.error(req, res, err);
				});
		},

		get: (req, res) => {
			req.originalUrl = req.originalUrl.split('?')[0];

			var args = {
				'req': req,
				'res': res
			};

			args.req.body = args.req.query;

			var myModule = new dal.module();
			myModule.files.get(args)
				.then(args => {
					__responder.success(req, res, args.result);
				}, err => {
					__responder.error(req, res, err);
				});
		},

		list: (req, res) => {
			var args = {
				'req': req,
				'res': res
			};

			var myModule = new dal.module();
			myModule.files.list(args)
				.then(tools.setRoleList, null)
				.then(args => {
					__responder.success(req, res, args.result);
				}, err => {
					__responder.error(req, res, err);
				});
		},

		share: (req, res) => {
			var args = {
				'req': req,
				'res': res
			};

			var myModule = new dal.module();
			myModule.files.share(args)
				.then(args => {
					__responder.success(req, res, args.result);
				}, err => {
					__responder.error(req, res, err);
				});
		},

		update: (req, res) => {
			var args = {
				'req': req,
				'res': res
			};

			var myModule = new dal.module();
			myModule.files.update(args)
				.then(args => {
					__responder.success(req, res, args.result);
				}, err => {
					__responder.error(req, res, err);
				});
		},

		delete: (req, res) => {
			var args = {
				'req': req,
				'res': res
			};

			var myModule = new dal.module();
			myModule.files.delete(args)
				.then(args => {
					__responder.success(req, res, args.result);
				}, err => {
					__responder.error(req, res, err);
				});
		},

		unsubscribe: (req, res) => {
			var args = {
				'req': req,
				'res': res
			};

			var myModule = new dal.module();
			myModule.files.unsubscribe(args)
				.then(args => {
					__responder.success(req, res, args.result);
				}, err => {
					__responder.error(req, res, err);
				});
		},

		updatesubscriber: (req, res) => {
			var args = {
				'req': req,
				'res': res
			};

			var myModule = new dal.module();
			myModule.files.updatesubscriber(args)
				.then(args => {
					__responder.success(req, res, args.result);
				}, err => {
					__responder.error(req, res, err);
				});
		}
	};

	return {
		'zips': bllZips,
		'files': bllFiles
	};
};

exports.module = module;