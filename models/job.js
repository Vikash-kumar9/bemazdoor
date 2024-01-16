const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    info: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    address: {
        type :String
    },
    
    otherState: String,
   
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        default: function() {
            // Use req.session.userId as the default value
            return this.req ? this.req.session.userId : null;
        }},
        verified : {
            type : Boolean,
            default: false
        }
   
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
