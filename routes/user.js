var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController')
const check = require('../controllers/check')

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/mailcheck',userController.mailcheck);
router.post('/mailtokencheck',userController.mailtokencheck);
router.use(check);
router.get('/info', userController.getInfo);
module.exports = router;
