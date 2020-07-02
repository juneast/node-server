const User = require('../models/user.js')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.register = (req,res)=>{
    const {userId, password} = req.body;
    let newUser = null;
    const create = (user) => {
        if(user) {
            throw new Error('id exists')
        } else {
            return User.create(userId, password)
        }
    }

    // count the number of the user
    const count = (user) => {
        newUser = user
        return User.countDocuments({}).exec()
    }
    const assign = (count)=>{
        if(count===1){
            return newUser.assignAdmin();
        } else {
            return Promise.resolve(false);
        }
    }

    const respond = (isAdmin) =>{
        res.json({
            message:'registered successfully',
            admin : isAdmin ? true : false
        })
    }

    const onError = (error) =>{
        res.status(409).json({
            message:error.message
        })
    }
    User.findOneByUserId(userId).then(create).then(count)
    .then(assign).then(respond).catch(onError);
};

exports.login =(req,res,next)=>{
    const {userId,password} = req.body
    const ip_addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const secret = req.app.get('jwt-secret');
    const timestamp = new Date().getTime();

    const check = (user)=>{
        if(!user){
            throw new Error('login failed')
        } else {
            if(user.verify(password)) {
                return new Promise((resolve, reject)=>{
                    jwt.sign({
                        _id : user._id,
                        username : user.username,
                        ip_addr : ip_addr,
                        timestamp : timestamp,
                        admin : user.admin
                    },
                    secret,
                    {
                        expiresIn :'7d',
                        issuer : 'LDJ',
                        subject : 'userInfo'
                    },(err,token)=>{
                        if(err) reject(err);
                        else{
                            res.cookie('token', token {
                                       //maxAge:3600*24
                                       })
                            
                        }
                        resolve(token);
                    });
                })

            } else {
                throw new Error('login failed');
            }
        }

    }

    const respond = (token)=>{
        res.json({
            message: 'logged in successfully',
            token
        })
    }

    const onError = (error)=>{
        res.status(403).json({
            message:error.message
        })
    }

    User.findOneByUserId(userId).then(check).then(respond).catch(onError);
}


exports.mailcheck = (req, res, next) => {

    const regex=/([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

    const email = req.body.email;

    //if(email == '' || !regex.test(email)) {
     //   return res.status(400).json({ success: false, message: '정상적인 이메일을 입력해주세요.'});

    //}
    const secret = req.app.get('jwt-secret');
    const timestamp = new Date().getTime();
    const emailVerificationToken = jwt.sign({
                        email :  email,
                        timestamp : timestamp
                    },
                    secret,
                    {
                        expiresIn :'7d',
                    });

    //const emailVerificationToken = crypto.randomBytes(20).toString('hex');

    // 대학교 이메일인지에 대한 검증 로직과 이미 존재하는 메일에 대한 검증 로직 구현 필요

    const smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'kdu6396@gmail.com',
            pass: 'ehddnr1234'
        }
    })

    const mailOptions = {
        from: 'kdu6396@gmail.com',
        to: email,
        subject: '[KB금융그룹] 이메일 인증',
        html: "안녕하세요. KB데이타시스템 김동욱 주임 입니다.<br/><br/>회원가입을 위해 아래의 인증 코드를 복사하여 입력해주시기 바랍니다.<br/><br/><span style='color: red; font-weight:bold'>"+emailVerificationToken+"</span><br/><br/>감사합니다!"
    };


    smtpTransport.sendMail(mailOptions, (error, responses) =>{
        if(error){
            res.json(error);
        }else{
            return res.status(200).json({ success: true, message: '인증코드가 전송되었습니다.'});

        }
        smtpTransport.close();
    });
}


exports.mailtokencheck = (req, res, next) => {

    const email = req.body.email;
    const emailVerificationToken = req.body.email_token;

    console.log(email);
    console.log(emailVerificationToken);
    console.log(req.body.email_token);
    if(!emailVerificationToken) {

        return res.status(401).json({
            success: false,
            message: '인증코드를 정확히 입력해주세요.'
        })
    }
        const p = new Promise(
        (resolve, reject) => {
                jwt.verify(emailVerificationToken, req.app.get('jwt-secret'), (error, decoded) => {
                                        if(error || (email != decoded.email)){
                                                        return res.status(401).json({ success: false, message: '인증코드가 틀렸습니다.'});
                                        }
                                        else{

                                                return res.status(200).json({ success: true, message: '인증 성공'});
                                        }

                                        console.log("Success!!");
                                        resolve(decoded)
                                })
        })
    // if it has failed to verify, it will return an error message
    const onError = (error) => {
        res.status(401).json({
            success: false,
            message: error.message
        })
    }

    // process the promise
    p.then((decoded)=>{
        req.decoded = decoded
        next()
    }).catch(onError)
}
