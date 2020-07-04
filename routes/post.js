var express = require('express');
var router = express.Router();
const postController = require('../controllers/postController')
const check = require('../controllers/check')


router.use(check);
router.get('/like',postController.like);
router.get('/unlike',postController.unlike);
router.post('/', postController.save);
router.get('/', postController.getAll)
router.get('/:postid', postController.getOne)
router.delete('/:postid',postController.delete);
router.put('/:postid',postController.update)

module.exports = router;
