var express = require('express');
var router = express.Router();
const postController = require('../controllers/postController')
const check = require('../controllers/check')
const uploadController = require('../controllers/uploadController')

router.use(check);
router.get('/my', postController.userPosts)

router.get('/like',postController.like);
router.get('/unlike',postController.unlike);
router.post('/', uploadController.upload.array('photos'),postController.save);
router.get('/', postController.getAll)
router.get('/:postid', postController.getOne)
router.delete('/:postid',postController.delete);
router.put('/:postid',postController.update)
module.exports = router;
