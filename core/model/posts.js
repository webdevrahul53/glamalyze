const mongoose = require('../connection');

const postSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    user_id:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'Users'},
    image:{type:String,required:true},
    caption:{type:String,required:true},
    likes:[{type: mongoose.Schema.Types.ObjectId, ref: 'Users'}],
    comments: [{
        _id: {type: mongoose.Schema.Types.ObjectId},
        user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
        email: {type:String,required:true},
        text: {type:String,required:true},
        created_at: {type: Date, default: new Date()}
    }],
    created_at:{type:Date,default:new Date()}
})

module.exports = mongoose.model('Posts',postSchema);