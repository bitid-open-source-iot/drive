var express     		= require('express');
var router      		= express.Router();
var multipart 			= require('connect-multiparty');
var bllModule 			= require('../bll/bll');
var multipartMiddleware = multipart();

router.use(function timeLog(req, res, next) {
  	next();
});

router.get('/get', (req, res) => {
	console.log(1);
    var myModule = new bllModule.module();
	myModule.files.get(req, res);
});

router.post('/list', (req, res) => {
	var myModule = new bllModule.module();
	myModule.files.list(req, res);
});

router.post('/share', (req, res) => {
	var myModule = new bllModule.module();
	myModule.files.share(req, res);
});

router.post('/upload', multipartMiddleware, (req, res) => {
    var myModule = new bllModule.module();
	myModule.files.upload(req, res);
});

router.post('/update', (req, res) => {
	var myModule = new bllModule.module();
	myModule.files.update(req, res);
});

router.post('/delete', (req, res) => {
	var myModule = new bllModule.module();
	myModule.files.delete(req, res);
});

router.post('/unsubscribe', (req, res) => {
	var myModule = new bllModule.module();
	myModule.files.unsubscribe(req, res);
});

router.post('/updatesubscriber', (req, res) => {
	var myModule = new bllModule.module();
	myModule.files.updatesubscriber(req, res);
});

module.exports = router;