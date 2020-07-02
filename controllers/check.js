const jwt = require('jsonwebtoken')

const check = (req, res, next) => {
    // read the token from header or url
    //const token = req.headers['x-access-token'] || req.query.token
    const token = req.cookies.token;
    const client_ipaddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress

    //console.log(req.headers);
    //console.log(token);
    // token does not exist
    if(!token) {

        return res.status(401).json({
            success: false,
            message: 'not logged in'
        })
    }

    // create a promise that decodes the token
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
                if(err || (client_ipaddr != decoded.ip_addr)){
                        return res.status(401).json({ success: false, message: 'Failed to authenticate token'});
                }
                //if(err) reject(err)
                resolve(decoded)
            })
        }
    )

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

module.exports = check;
