const express = require('express');
const router = express.Router();

const session = require('express-session')
const { registerUser, verifyUser, updateUser } = require('../controllers/userControllers');
const User = require('../models/User');
const emailMiddleware = require('../middleware/emailVerification');
const { mazdoorRouter } = require('./mazdoor');

router.use(
  session({
      secret: 'this-is-damm-seceret-500', // Change this to a random and secure string
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true } // Set secure to true in a production environment with HTTPS
  })
);

router.use(emailMiddleware);



 router.post('/signup',  registerUser); 
 router.post('/login', verifyUser); 

 
router.put( '/updateUser', updateUser)

router.get('/user/update', async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.render('updateUser', {
      message: 'Update your credentials here',
      user: user,
    });
  } catch (error) {
    console.error('Error rendering update form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle the update form submission
router.post('/user/update',  updateUser);

// ... (other routes and configurations)

router.get('/user/delete' , async ( req, res) => {
   const userId = req.session.userId;
  const del = await User.findByIdAndDelete(userId);

  if ( del ) {

    res.render('message' , { message : 'user deleted successfully '})
    req.session.destroy()
  }
  else {
    res.render('message' , {message : 'user not deleted something went wrong, try again.'})
  }

})

router.get('/verify/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch the user based on userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).render('message', { message: 'User not found' });
    }

    // Check if the verification link is clicked within a certain time frame (e.g., 24 hours)
    const verificationTimeLimit = 1 * 60 * 60 * 1000; // 1 hours in milliseconds
    const currentTime = new Date();
    const verificationTime = user.createdAt.getTime() + verificationTimeLimit;

    if (currentTime > verificationTime) {
      // Verification link expired, delete the user data
      await User.findByIdAndDelete(userId);
      return res.status(403).render('message', { message: 'Verification link expired. Please sign up again.' });
    }

    // Set is_verified to true
    user.is_verified = true;
    await user.save();

    // Redirect or render a success page
    res.render('verify-email', { userId: userId, title: 'verification', log: req.session.userId });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).render('message', { message: 'Internal Server Error' });
  }
});


router.post('/email-verified', async (req, res) => {
  const userId = req.body.userId;

  try {
    // Update the user's 'is_verified' field to true
    const updatedUser = await User.findByIdAndUpdate(userId, { is_Verified: true }, { new: true });

    if (!updatedUser) {
      return res.status(404).render('messae', { message: 'User not found' });
    }

    res.render('message', { message: 'Email successfully verified!' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).render('message', { message: 'Internal Server Error' });
  }
});

router.get('/okk', async (req, res) => {
  try {
    res.redirect('/')
  } catch (error) {
    console.error('Error checking user verification status:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;