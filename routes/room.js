var express = require('express');
var router = express.Router();
const roomController = require('../controllers/roomController')
const check = require('../controllers/check')


router.use(check);
router.post('/', roomController.save);
router.get('/', roomController.getRoomList)
// router.get('/:postid', roomController.getOne)
// router.delete('/:postid',roomController.delete);
// router.put('/:postid',roomController.update)

module.exports = router;
