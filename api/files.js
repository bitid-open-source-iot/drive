var bll			= require('../bll/bll');
var router		= require('express').Router();
var multipart	= require('connect-multiparty')();

router.use(function timeLog(req, res, next) {
  	next();
});

router.get('/get', (req, res) => {
    var myModule = new bll.module();
	myModule.files.get(req, res);
});

router.post('/list', (req, res) => {
	var myModule = new bll.module();
	myModule.files.list(req, res);
});

router.post('/share', (req, res) => {
	var myModule = new bll.module();
	myModule.files.share(req, res);
});

router.post('/upload', multipart, (req, res) => {
    var myModule = new bll.module();
	myModule.files.upload(req, res);
});

router.post('/update', (req, res) => {
	var myModule = new bll.module();
	myModule.files.update(req, res);
});

router.post('/delete', (req, res) => {
	var myModule = new bll.module();
	myModule.files.delete(req, res);
});

router.post('/unsubscribe', (req, res) => {
	var myModule = new bll.module();
	myModule.files.unsubscribe(req, res);
});

router.post('/updatesubscriber', (req, res) => {
	var myModule = new bll.module();
	myModule.files.updatesubscriber(req, res);
});

module.exports = router;