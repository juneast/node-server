const Comment = require('../models/comment')
const Count = require('../models/count')
const Post = require('../models/post')
exports.save = async (req, res) => {
    req.body.user_id = req.decoded._id;
    try {
        const post = await Post.findByPostId(req.params.postid, "inc");
        req.body.post_id = post._id;
        const count = await Count.getNextNum('comment');
        req.body.commentid = count.lastNum;
        const comment = await Comment.createComment(req.body);
        res.status(200).json({
            "message": "Save comment successfully",
            "commentid": comment.commentid
        });
    } catch (err) {
        console.log(err);
        res.json({
            "message": err.message
        })
    }
}

exports.getCommentsByPostId = async (req, res) => {
    const { _id } = req.decoded;
    try {
        const post = await Post.findByPostId(req.params.postid);
        let comments = await Comment.getCommentsByPostId(post._id);
        comments = comments.map(item => {
            item._doc.isAuthor = item.author._id.toString() === _id ? true : false;
            item._doc.likes = item.like.indexOf(_id) === -1 ? false : true;
            delete item._doc.like;
            return item;
        })
        res.status(200).send(comments);
    } catch (err) {
        console.log(err);
        res.status(407).json({
            "message": "Fetch comment failed"
        })
    }
}

exports.delete = async (req, res) => {
    const { _id } = req.decoded;
    console.log(req.params);
    const commentid = req.params.commentid;
    try {
        const temp = await Comment.getCommentByCommentId(commentid);
        const comment = await Comment.deleteComment(commentid, _id);
        if (comment.deletedCount === 1) {
            const post = await Post.findByPostId(temp.post, "dec");
            res.status(200).json({
                "message": "Delete comment successfully"
            });
        } else {
            throw new Error('cannot match comment id');
        }

    } catch (err) {
        res.status(407).json({
            "message": err.message
        })
    }
}

exports.like = async (req, res) => {
    const { _id: userid } = req.decoded;
    const { commentid } = req.query;
    try {
        const comment = await Comment.likeComment(commentid, userid);
        if (comment.nModified) {
            res.status(200).json({
                "message": "Update like successfully"
            });
        } else {
            throw new Error('cannot match comment id');

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
    const { commentid } = req.query;
    try {
        const comment = await Comment.unlikeComment(commentid, userid);
        if (comment.nModified) {
            res.status(200).json({
                "message": "Delete like successfully"
            });
        } else {
            throw new Error('cannot match comment id');
        }
    } catch (err) {
        console.log(err);
        res.status(407).json({
            "message": err.message
        })
    }
}