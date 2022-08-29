const bll = require('../bll/bll')
const router = require('express').Router()

router.use((req, res, next) => {
  next()
})

router.get('/get', (req, res) => {
  const myModule = new bll.module()
  myModule.files.get(req, res)
})

router.post('/list', (req, res) => {
  const myModule = new bll.module()
  myModule.files.list(req, res)
})

router.post('/share', (req, res) => {
  const myModule = new bll.module()
  myModule.files.share(req, res)
})

router.post('/upload', (req, res) => {
  const myModule = new bll.module()
  myModule.files.upload(req, res)
})

router.post('/update', (req, res) => {
  const myModule = new bll.module()
  myModule.files.update(req, res)
})

router.post('/delete', (req, res) => {
  const myModule = new bll.module()
  myModule.files.delete(req, res)
})

router.post('/unsubscribe', (req, res) => {
  const myModule = new bll.module()
  myModule.files.unsubscribe(req, res)
})

router.post('/update-subscriber', (req, res) => {
  const myModule = new bll.module()
  myModule.files.updatesubscriber(req, res)
})

module.exports = router
