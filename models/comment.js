const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Comment = new Schema({
    commentid : {type:Number, required : true},
    content : String,   
    createTime : {type:Date,defalut:Date.now},
    author : {type:Schema.Types.ObjectId , ref:'User'},
    post : {type:Schema.Types.ObjectId, ref:'Post'}
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

Comment.statics.deleteComment = function(commentid) {
    return this.deleteOne({commentid});
}

Comment.statics.deleteCommentByPostId = function(post_id) {
    return this.deleteMany({post:post_id});
}

module.exports = mongoose.model('Comment', Comment);