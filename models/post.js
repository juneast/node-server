const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Post = new Schema({
    postid : {type:Number, required : true},
    createTime : {type:Date,defalut:Date.now},
    modifyTime : Date,
    title : String,
    content : String,
    views : {type:Number, default : 0},
    author : {type:Schema.Types.ObjectId , ref:'User'},
    like : [{type:Schema.Types.ObjectId , ref:'User'}]
})

Post.statics.createPost = function(item, _id){
    const post = new this({
        postid : item.postid,
        createTime : Date.now(),
        modifyTime : Date.now(),
        title : item.title,
        content : item.content,
        author : _id
    })
    return post.save();
}

Post.statics.findByPostId = function(postid) {
    return this.findOne({postid});
}

Post.statics.increasePostViews = function(postid) {
    return this.findOneAndUpdate({postid},{$inc : {views:1}},{new:true});    
}

Post.statics.findAllPosts = function(last) {
    if(last===undefined){
        return this.find({}).populate('author','userId').sort("-createTime").limit(10);
    }
    return this.find({}).populate('author','userId').sort("-createTime").lt("postid",last).limit(10);
}

Post.statics.deletePost = function(postid) {
    return this.deleteOne({postid});
}

Post.statics.updatePost = function({postid, title, content}){
    return this.updateOne(
        {postid},
        {"$set" : {title, content, modifyTime:Date.now()}}
    );
}

Post.statics.likePost = function({postid, userid}){
    return this.updateOne(
        {postid},
        {$addToSet : {like:new mongoose.Types.ObjectId(userid)}}
    );
}

Post.statics.unlikePost = function({postid, userid}){
    return this.updateOne(
        {postid},
        { $pull: { like : userid } }
    );
}

module.exports = mongoose.model('Post', Post)