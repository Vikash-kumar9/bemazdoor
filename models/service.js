const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    organizationName : {
        type: String,
        required: true,

    },
    address : {
        type: String,
        required : true
    },
    image: {
        type:[String],
        
    },
    contactNo : {
        type: Number,
      
        minlength: 10,
        maxlength: 10,

    },
    type: {
        type:String,
        required: true
    },
    city :{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },

 otherState: String,

    about : {
        type: String,
        default : 'visit our services'
    },
    availability: {
        type: [String],
        
    },
    businessEmail : {
        type: String,
        validate: {
            validator: function(value) {
                // Use a regular expression to validate the email format
                // This is a basic example, and you may want to use a more comprehensive one
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Invalid email format',
        },

    },
    created: {
        type: Date,
        default: Date.now,
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



const Service = new mongoose.model('Service' , serviceSchema);

module.exports = Service;
