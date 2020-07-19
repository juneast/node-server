const Post = require('../models/post')
const Count = require('../models/count')
const Comment = require('../models/comment')

exports.save = async (req, res) => {
    const { _id } = req.decoded;
    try {
        const count = await Count.getNextNum('post');
        req.body.postid = count.lastNum;
        req.body.files = req.files.map((item)=>{
            return item.location;
        });
        console.log(req.body);
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
    let {last, type, tag} = req.query;
    if(type!==undefined && type!=="views" && type!=="comments" && type!=="like" && type!=="createTime"){
        return res.status(404).json({
            "message": "invalid query"
        })
    }
    if(type==="like") type="likeCount"
    try {
        let posts = await Post.findAllPosts(last, type, tag);
        const newPosts = posts.map((item,index) => {
            let temp = {
                views : item.views,
                postid : item.postid,
                createTime : item.createTime,
                modifyTime :item.modifyTime,
                title : item.title,
                content : item.content,
                author : item.author,
                likes : false,
                likeCount : item.likeCount,
                comments : item.comments,
                tag : item.tag,
                isAuthor : item.author._id.toString()===_id ? true : false,
                photos : item.photos
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
    const { _id } = req.decoded;
    const postid = req.params.postid;
    let flag = false;
    if (req.cookies.postids && req.cookies.postids.indexOf(postid) !== -1) {
        flag = true;
    }
    try {
        let item;
        if(!flag){
            item = await Post.increasePostViews(postid);
            if (!req.cookies.postids) {
                res.cookie('postids', [postid], {
                    maxAge: 3600 * 24
                })
            } else {
                res.cookie('postids', [...req.cookies.postids, postid], {
                    maxAge: 3600 * 24
                })
            }
        } else {
            item = await Post.increasePostViews(postid,1);
        }
        let posts = {
            views : item.views,
            postid : item.postid,
            createTime : item.createTime,
            modifyTime :item.modifyTime,
            title : item.title,
            content : item.content,
            author : item.author,
            likes : item.like.indexOf(_id)===-1? false : true,
            likeCount : item.likeCount,
            comments : item.comments,
            tag : item.tag,
            isAuthor : item.author._id.toString()===_id ? true : false,
            photos : item.photos
        }
        if(item.like.indexOf(_id)!==-1){
            posts.likes = true;
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
    const { _id } = req.decoded;
    console.log(req.params);
    const postid = req.params.postid;
    try {
        const post = await Post.deletePost(postid, _id);
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
            await Post.updateLikeCount(postid,1);
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
        if (post.nModified) {
            await Post.updateLikeCount(postid, -1);
            res.status(200).json({
                "message": "Delete like successfully"
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

exports.search = async (req, res) => {
    const { _id} = req.decoded;
    const { string } = req.query;
    try {
        const posts = await Post.search(string);
        const newPosts = posts.map((item,index) => {
            let temp = {
                views : item.views,
                postid : item.postid,
                createTime : item.createTime,
                modifyTime :item.modifyTime,
                title : item.title,
                content : item.content,
                author : item.author,
                likes : false,
                likeCount : item.likeCount,
                comments : item.comments,
                tag : item.tag,
                isAuthor : item.author._id.toString()===_id ? true : false,
                photos : item.photos
            }
            if(item.like.indexOf(_id)!==-1){
                temp.likes = true;
            }
            return temp;
        }) 
        res.status(200).send(newPosts);
    } catch (err) {
        console.log(err);
        res.status(407).json({
            "message": err.message
        })
    }
}