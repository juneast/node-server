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
    const { _id } = req.decoded;
    const {last} = req.query;

    try {
        let posts = await Post.findAllPosts(last);
        const newPosts = posts.map((item) => {
            let temp = {
                views : item.views,
                postid : item.postid,
                createTime : item.createTime,
                modifyTime :item.modifyTime,
                title : item.title,
                content : item.content,
                author : item.author,
                likes : false,
            }
            if(item.like.indexOf(_id)!==-1){
                temp.likes = true;
            }
            return temp;
        }) 
        res.status(200).send(newPosts);
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
                maxAge: 3600 * 24
            })
        } else {
            res.cookie('postids', [...req.cookies.postids, postid], {
                maxAge: 3600 * 24
            })
        }

        res.status(200).send(posts);
    } catch (err) {
        console.log(err);
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
    const { _id: userid } = req.decoded;
    const { postid } = req.query;
    try {
        const post = await Post.likePost({ postid, userid });
        if (post.nModified) {
            res.status(200).json({
                "message": "Update like successfully"
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
exports.unlike = async (req, res) => {
    const { _id: userid } = req.decoded;
    const { postid } = req.query;
    try {
        const post = await Post.unlikePost({ postid, userid });
        console.log(post);
            res.status(200).json({
                "message": "Delete like successfully"
            });

    } catch (err) {
        console.log(err);
        res.status(407).json({
            "message": err.message
        })
    }
}
