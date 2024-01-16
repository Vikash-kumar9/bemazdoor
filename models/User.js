const mongoose = require('mongoose');




const userSchema = new mongoose.Schema({
    username : {
        type : String ,
        required  : true
     
    },
    
   
    email : {
    type : String,
    required  : true,
    unique: true
  

    },
     Password : { 
        type : String,
        required  : true
      
     },
     
     create : {
        type : Date,
        default : Date.now

     },
      

      is_Verified: {
        type : Boolean,
        default: false
      }
    });


const User = new mongoose.model("User" , userSchema);

module.exports = User;