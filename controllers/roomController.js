const Room = require('../models/room')
const User = require('../models/user')

exports.save = async (req, res) => {
    const { _id } = req.decoded;
    const {userList} = req.body;
    let users = [_id];
    try {
        for(let i=0; i<userList.length; i++){
            const user = await User.findOneByUserId(userList[i]);
            if(user===null) {
                throw new Error(`cannot find user {${userList[i]}}`);
            }
            users.push(user._id);
        } //유효한 user인지 확인
        const checkRoom = await Room.findByUsers(users); //userList가 중복되는 방이 있는지 확인
        if(checkRoom===null) {
            const result = await Room.createRoom(users);
        } else {
            throw new Error(`already exist room`);
        }
        res.status(200).json({
            "message": "Save room successfully",
        });
    } catch (err) {
        console.log(err);
        res.json({
            "message": err.message
        })
    }
}

exports.getRoomList = async (req, res) => {
    const { _id } = req.decoded;

    try {
        const result = await Room.getRooms(_id);
        console.log(result);
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        res.json({
            "message": err.message
        })
    }
}
