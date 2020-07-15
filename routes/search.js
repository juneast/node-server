var express = require('express');
var router = express.Router();
const postController = require('../controllers/postController')
const check = require('../controllers/check')

router.use(check);
router.get('/', postController.search)

module.exports = router;
