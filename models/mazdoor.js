const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    username: {
        type: String,
        required  : true,


    },
    phoneNumber: {
        type: Number,
        required  : true,
        
        
       
       
    },
    type: {
        type: String,
        required  : true,


    },
    address: {
        type: String,
        required  : true,


    },
    city:{
        type:String,
        required:true
    },

   state:{
        type:String,
        required:true
    },
    otherState: String,

     image : {
        type: String,
        

    },
    about: {
        type: String,
        default: '',
    },
    create: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        default: function() {
            // Use req.session.userId as the default value
            return this.req ? this.req.session.userId : null;
        }}
   
});


const Mazdoor = mongoose.model("Mazdoor", personSchema);

module.exports = Mazdoor;
