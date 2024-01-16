const mongoose = require('mongoose');

// Comment Schema
const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    username: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    replies: [this], // Nested comments (replies)
});

// Portal Schema
const portalSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    phonenumber: {
        type: Number
    },
    type: {
        type: String
    },
    need: {
        type: String,
        required: true
    },
    city: {
        type: String
    },
    address: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        default: function () {
            // Use req.session.userId as the default value
            return this.req ? this.req.session.userId : null;
        }
    },
    comments: [commentSchema], // Reference to the Comment schema
});

const Portal = mongoose.model('Portal', portalSchema);
const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Portal, Comment };
