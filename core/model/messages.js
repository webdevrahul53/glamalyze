const mongoose = require('../connection');

const messageSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    participants:[{
        _id: mongoose.Schema.Types.ObjectId,
        user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Users' },
        // email: { type: String, required: true }
    }],
    messages:[{
        _id: {type:mongoose.Schema.Types.ObjectId,ref:'Users'},
        senderId: {type:mongoose.Schema.Types.ObjectId,ref:'Users'},
        text: {type: String},
        status: {type: String},
        created_at: {type: Date, default: new Date()}
    }],
    created_at:{type:Date,default:new Date()}
})

messageSchema.index({ participants: 1 }, { unique: true });

module.exports = mongoose.model('Messages',messageSchema);