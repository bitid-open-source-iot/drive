const bll = require('../bll/bll');
const router = require('express').Router();

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

router.post('/upload', (req, res) => {
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