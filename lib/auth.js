var Q 		= require('q');
var fetch	= require('node-fetch');

exports.authenticate = async (args) => {
	var deferred = Q.defer();

	var payload = JSON.stringify({
		'header': {
			'email': args.req.body.header.email,
			'appId': args.req.body.header.appId
		},
		'reqURI': args.req.originalUrl
	});

	const response = await fetch(__settings.auth.host, {
		'headers': {
			'accept':         '*/*',
			'Content-Type':   'application/json; charset=utf-8',
			'Authorization':  args.req.headers.authorization,
			'Content-Length': payload.length
		},
		'body':   payload,
		'method': "POST"
	});

	const result = await response.json();

	if (typeof(result.errors) != "undefined") {
		deferred.reject({
			'error': result
		});
	} else {
		deferred.resolve(args);
	};

	return deferred.promise;
};