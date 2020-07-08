const Comment = require('../models/comment')
const Count = require('../models/count')
const Post = require('../models/post')
exports.save = async (req,res)=> {
    req.body.user_id = req.decoded._id;
    try {
        const post = await Post.findByPostId(req.params.postid,"inc");
        req.body.post_id = post._id;
        const count = await Count.getNextNum('comment');
        req.body.commentid = count.lastNum;
        const comment = await Comment.createComment(req.body);
        res.status(200).json({
            "message" : "Save comment successfully",
            "commentid" : comment.commentid
        });
    } catch (err){
        console.log(err);
        res.json({
            "message" : err.message
        })
    }
}

exports.getCommentsByPostId = async (req,res)=> {
    try {
        const post = await Post.findByPostId(req.params.postid);
        const comments = await Comment.getCommentsByPostId(post._id);
        res.status(200).send(comments);
    } catch (err){
        console.log(err);
        res.status(407).json({
            "message" : "Fetch comment failed"
        })
    }
}

exports.delete = async (req,res) => {
    console.log(req.params);
    const commentid = req.params.commentid;
    try {
        const temp = await Comment.getCommentByCommentId(commentid);
        const comment = await Comment.deleteComment(commentid);
        if(comment.deletedCount===1){
            const post = await Post.findByPostId(temp.post,"dec");
            res.status(200).json({
                "message" : "Delete comment successfully"
            });
        } else {
            throw new Error('cannot match comment id');
        }
        
    } catch (err){
        res.status(407).json({
            "message": err.message
        })
    }
}
