const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const bcrypt = require('bcrypt');


// Consider placing utility functions in a separate file

const securepassword = async (Password) => {
    try {
        const passwordhash = await bcrypt.hash(Password, 10);
        return passwordhash;
    } catch (error) {
        console.error('Password hashing failed:', error);
        throw new Error('Password hashing failed');
    }
};






const registerUser = async (req, res) => {
    try {
        const spassword = await securepassword(req.body.Password);

        const user = new User({
            username: req.body.username,
         
            email: req.body.email,
            
            Password: spassword,
            
            
        });

        const userData = await user.save();

        if (userData) {
            req.session.userId = userData._id;
            const mailOptions = {
                from: 'your-email@gmail.com',
                to: req.body.email,
                subject: 'gomazdoor.com ,Please verify your email',
                html: `<style>
                body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f7f7f7;
                  text-align: center;
                  padding: 20px;
                }
              
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
              
                h1 {
                  color: #333;
                  font-size: 24px;
                  margin-bottom: 20px;
                }
              
                a {
                  display: inline-block;
                  padding: 10px 20px;
                  font-size: 16px;
                  text-decoration: none;
                  background-color: #3498db;
                  color: #fff;
                  border-radius: 5px;
                  transition: background-color 0.3s;
                }
              
                a:hover {
                  background-color: #2980b9;
                }
              </style>
              
              <body>
                <div class="container">
                  <h1>Hey ${req.body.username}!</h1>
                  <p>Thanks for signing up! To get started, please verify your email address by clicking the link below:</p>
                  <p><a href="http://localhost:4000/verify/${req.session.userId}">Verify Your Email</a></p>
                  <p>If you didn't sign up, you can ignore this email.</p>
                </div>
              </body>
              `,
              };

              res.sendEmail(mailOptions);
            res.render('verify-email1', { title : 'verification' ,message: 'First verify email address then <span style="color:red;font-size:40px;">CLICKED<span> the button' });
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const verifyUser = async (req, res) => {
    const { email, Password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.render('login', { message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(Password, user.Password);

        if (passwordMatch) {

            if (user.is_Verified === false) {
                res.render('login',{ message : 'You are not verified user SignUp again'})
            } else {
                req.session.userId = user._id;
                res.redirect('/');
            }
           
        } else {
            res.render('login', { message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

const updateUser = async (req, res) => {
    try {
      const userId = req.session.userId;
  
      if (!userId) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }
  
      const updateData = {
        username: req.body.username,
       
        email: req.body.email,
        Password: req.body.Password,
      };
  
      // If a new image is uploaded, update the 'image' field
      if (req.file) {
        updateData.image = req.file.filename;
      }
  
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true, // Return the updated document
      });
  
      res.send('sucessfully updated');
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
 

module.exports = {
    registerUser,
    verifyUser,
    
    updateUser,
    
};
