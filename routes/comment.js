var express = require('express');
var router = express.Router();
const commentController = require('../controllers/commentController')
const check = require('../controllers/check')

router.use(check);
router.get('/like',commentController.like);
router.get('/unlike',commentController.unlike);
router.post('/:postid', commentController.save);
router.get('/:postid', commentController.getCommentsByPostId)
router.delete('/:commentid',commentController.delete);

module.exports = router;
