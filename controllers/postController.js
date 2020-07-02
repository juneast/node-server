const Post = require('../models/post')
const Count = require('../models/count')

exports.save = async (req, res) => {
    const { _id } = req.decoded;
    console.log(req.decoded);
    try {
        const count = await Count.getNextNum('post');
        req.body.postid = count.lastNum;
        const post = await Post.createPost(req.body, _id);
        res.status(200).json({
            "message": "Save post successfully",
            "postid": post.postid
        });
    } catch (err) {
        console.log(err);
        res.json({
            "message": err.message
        })
    }
}

exports.getAll = async (req, res) => {
    try {
        const posts = await Post.findAllPosts();
        res.status(200).send(posts);
    } catch (err) {
        console.log(err);//DB 조회 실패시 상태코드는 무엇인가..
        res.status(407).json({
            "message": "Fetch post failed"
        })
    }
}
exports.getOne = async (req, res) => {
    const postid = req.params.postid;
    if (req.cookies.postids && req.cookies.postids.indexOf(postid) !== -1) {     
        return res.status(204).end();
    }
    try {
        const posts = await Post.increasePostViews(postid);
        if (!req.cookies.postids) {
            res.cookie('postids', [postid], {
                maxAge: 3600*24
            })
        } else {
            res.cookie('postids', [...req.cookies.postids, postid], {
                maxAge: 3600*24
            })
        }
        
        res.status(200).send(posts);
    } catch (err) {
        console.log(err);//DB 조회 실패시 상태코드는 무엇인가..
        res.status(407).json({
            "message": "Fetch post failed"
        })
    }
}

exports.delete = async (req, res) => {
    console.log(req.params);
    const postid = req.params.postid;
    try {
        const post = await Post.deletePost(postid);
        if (post.deletedCount === 1) {
            res.status(200).json({
                "message": "Delete post successfully"
            });
        } else {
            throw new Error('cannot match post id');
        }
    } catch (err) {
        res.status(407).json({
            "message": err.message
        })
    }
}


exports.update = async (req, res) => {
    req.body.postid = req.params.postid;
    try {
        const post = await Post.updatePost(req.body);
        console.log(post);
        if (post.nModified) {
            res.status(200).json({
                "message": "Update post successfully"
            });
        } else {
        throw new Error('cannot match post id');
            
        }
    } catch (err) {
        console.log(err);
        res.status(407).json({
            "message": err.message
        })
    }
}

exports.like = async (req, res) => {
    const {postid, type} = req.query;
    const {postlike} = req.cookies;
    console.log(postlike)
    if(!postid || !type || (type!=1 && type!=-1)){
        return res.status(400).json({
            "message": "please check query string"
        });
    }
    if (type==1 && postlike && postlike.indexOf(postid)!==-1) {     
        return res.status(400).json({
            "message": `cannot like same post, postid = ${postid}`
        })
    }
    if (type==-1 && (!postlike || postlike.indexOf(postid)===-1)) {     
        return res.status(400).json({
            "message": `you didn't like this post, postid = ${postid}`
        })
    }
    try {
        const post = await Post.likePost(req.query);
        
        if(type==1) {
            if (!postlike) {
                res.cookie('postlike', [postid], {
                    maxAge: 3600*24
                })
            } else {
                res.cookie('postlike', [...postlike, postid], {
                    maxAge: 3600*24
                })
            }
        } else {
            if(postlike) {
                const temp = postlike.filter((item)=>{if(item!==postid) return item} );
                const maxAge = temp.length===0? 0 : 3600*24;
                res.cookie('postlike', temp, {
                    maxAge
                })
            }
        }

        if (post.nModified) {
            res.status(200).json({
                "message": "Update post successfully"
            });
        }
        else {
            throw new Error('cannot match post id');
        }
    } catch (err) {
        console.log(err);
        res.status(407).json({
            "message": err.message
        })
    }
}