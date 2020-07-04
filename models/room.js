const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Room = new Schema({
    users : [{type:Schema.Types.ObjectId , ref:'User'}]
})

Room.statics.createRoom = function(userList){
    const room = new this({
        users : userList.map((item) => new mongoose.Types.ObjectId(item))
    })
    return room.save();
}

Room.statics.findByUsers = function(userList) {
    return this.findOne({users : [...userList]});
}

Room.statics.getRooms = function(userid) {
    return this.find({users : userid}).populate('users','userId');
}

// Post.statics.increasePostViews = function(postid) {
// }

// Post.statics.findAllPosts = function() {
//     return this.find({}).populate('author','userId').sort("-createTime").limit(10);
// }

// Post.statics.deletePost = function(postid) {
//     return this.findOneAndUpdate({postid},{$inc : {views:1}},{new:true});
//     return this.deleteOne({postid});
// }

// Post.statics.updatePost = function({postid, title, content}){
//     return this.updateOne(
//         {postid},
//         {"$set" : {title, content, modifyTime:Date.now()}}
//     );
// }

// Post.statics.likePost = function({postid, userid}){
//     return this.updateOne(
//         {postid},
//         {$addToSet : {like:new mongoose.Types.ObjectId(userid)}}
//     );
// }

// Post.statics.unlikePost = function({postid, userid}){
//     return this.updateOne(
//         {postid},
//         { $pull: { like : userid } }
//     );
// }

module.exports = mongoose.model('Room', Room)