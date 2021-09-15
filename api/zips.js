const bll = require('../bll/bll');
const router = require('express').Router();

router.use((req, res, next) => {
	next();
});

router.get('/get', (req, res) => {
	var myModule = new bll.module();
	myModule.zips.get(req, res);
});

router.post('/add', (req, res) => {
	var myModule = new bll.module();
	myModule.zips.add(req, res);
});

router.post('/delete', (req, res) => {
	var myModule = new bll.module();
	myModule.zips.delete(req, res);
});

module.exports = router;