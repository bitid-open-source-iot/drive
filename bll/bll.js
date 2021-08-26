const dal = require('../dal/dal');
const auth = require('../lib/auth');
const tools = require('../lib/tools');

var module = function () {
	var bllFiles = {
		get: (req, res) => {
			var args = {
				'req': req,
				'res': res
			};
			var myModule = new dal.module();
			myModule.files.get(args)
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

		upload: (req, res) => {
			req.originalUrl = req.originalUrl.split('?')[0];

			var args = {
				'req': req,
				'res': res
			};

			var myModule = new dal.module();
			myModule.files.upload(args)
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

	var bllConfig = {
		get: async (req, res) => {
			var args = {
				req: req,
				res: res
			};

			auth.load(args)
				.then(args => {
					var result = JSON.parse(JSON.stringify(__settings.client));
					result.icon = args.result.icon;
					result.appId = args.result.appId;
					result.theme = args.result.theme;
					result.appName = args.result.name;
					__responder.success(req, res, result);
				}, err => {
					__responder.error(req, res, err);
				});
		}
	};

	return {
		'files': bllFiles,
		'config': bllConfig
	};
};

exports.module = module;