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
    like : [{type:Schema.Types.ObjectId , ref:'User'}],
    likeCount : {type:Number, default : 0},
    comments : {type:Number, default : 0},
    tag : String
})

Post.statics.createPost = function(item, _id){
    const post = new this({
        postid : item.postid,
        createTime : Date.now(),
        modifyTime : Date.now(),
        title : item.title,
        content : item.content,
        author : _id,
        comments : 0,
        tag : item.tag
    })
    return post.save();
}

Post.statics.findByPostId = function(postid, type) {
    if(type===undefined){
        return this.findOne({postid});
    }
    else if(type==="inc"){
        return this.findOneAndUpdate({postid},{$inc : {comments:1}},{new:true});
    } else {
        return this.findOneAndUpdate({_id:postid},{$inc : {comments:-1}},{new:true});
    }
    
}

Post.statics.increasePostViews = function(postid, num) {
    if(num===1){
        return this.findOne({postid});
    }
    return this.findOneAndUpdate({postid},{$inc : {views:1}},{new:true});    
}

Post.statics.findAllPosts = function(last, type, tag) {
    if(tag===undefined){
        if(last===undefined){
            return this.find({}).populate('author','userId').sort(`-${type} -createTime`).limit(10);
        }
        return this.find({}).populate('author','userId').sort(`-${type} -createTime`).lt("postid",last).limit(10);
    } else {
        if(last===undefined){
            return this.find({tag}).populate('author','userId').sort(`-${type} -createTime`).limit(10);
        }
        return this.find({tag}).populate('author','userId').sort(`-${type} -createTime`).lt("postid",last).limit(10);
    }
    
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
Post.statics.updateLikeCount = function(postid, num){
    return this.updateOne(
        {postid},
        { $inc: { likeCount : num} }
    );
}


module.exports = mongoose.model('Post', Post)