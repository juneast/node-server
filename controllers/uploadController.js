const aws = require('aws-sdk')
const multerS3 = require('multer-s3')
const config = require('../config')
const multer = require('multer')
const path = require('path');

const s3 = new aws.S3({
    accessKeyId : config.aws_key,
    secretAccessKey : config.aws_secret,
    region : 'ap-northeast-2'
})

exports.upload = multer({
    storage: multerS3({
        s3,
        acl : 'public-read',
        bucket : 'sagri/postimages',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metdata : function (req, file, cb) {
            cb(null, {fieldName : file.fieldName});
        },
        destination: function (req, file, cb) {
            cb(null, 'postimages/');
        },
        key : function (req,file,cb) {
            cb(null,Date.now().toString());
        }
    })
});