const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Comment = new Schema({
    commentid : {type:Number, required : true},
    content : String,   
    createTime : {type:Date,defalut:Date.now},
    author : {type:Schema.Types.ObjectId , ref:'User'},
    post : {type:Schema.Types.ObjectId, ref:'Post'},
    like : [{type:Schema.Types.ObjectId , ref:'User'}],
    likeCount : {type:Number, default : 0},
})

Comment.statics.createComment = function(item){
    const comment = new this({
        commentid : item.commentid,
        createTime : Date.now(),
        content : item.content,
        author : item.user_id,
        post : item.post_id
    })
    return comment.save();
}

Comment.statics.getCommentsByPostId = function(post_id) {
    return this.find({post : post_id}).populate({path:'author',select:'userId'});
}

Comment.statics.getCommentByCommentId = function(commentid) {
    return this.findOne({commentid});
}

Comment.statics.deleteComment = function(commentid,author) {
    return this.deleteOne({commentid, author});
}

Comment.statics.deleteCommentByPostId = function(post_id) {
    return this.deleteMany({post:post_id});
}
Comment.statics.likeComment = function(commentid, userid){
    return this.updateOne(
        {$and:[{commentid},{like:{$ne:userid}}]},
        {
            $push : {like:new mongoose.Types.ObjectId(userid)},
            $inc : {likeCount:1}
        }
    );
}

Comment.statics.unlikeComment = function(commentid, userid){
    return this.updateOne(
        {$and:[{commentid},{like:userid}]},
        {
            $pull : {like:userid},
            $inc : {likeCount:-1}
        }
    );
}

module.exports = mongoose.model('Comment', Comment);