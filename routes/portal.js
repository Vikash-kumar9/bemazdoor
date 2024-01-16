const express = require('express');
const portal = express.Router();
const User = require('../models/User');
const Mazdoor = require('../models/mazdoor');
const {Portal , Comment} = require('../models/portal');
const moment = require('moment');
const isLoggedIn = require('../middleware/islogin');

portal.use((req, res, next) => {
  // Check if the user is authenticated (logged in)
  if (req.session && req.session.userId) {
      // User is logged in, set loggedInUser
      loggedInUser = { _id: req.session.userId }; // Update this based on your user data structure
  } else {
      // User is not logged in, set loggedInUser to null or an appropriate value
      loggedInUser = null;
  }
  next();
});

portal.get('/portal-form' , async(req,res) => {
    res.render('portal-form' , { title : 'portal-form' , message: ' submit a request on portal', log: req.session.userId})
});


portal.post('/portal' , async( req,res) =>{
    try {
        const user = req.session.userId
        const portalData = new Portal({
            username : req.body.username,
            phonenumber: req.body.phonenumber,
            type: req.body.type,
            need: req.body.need,
            city : req.body.city,
            address: req.body.address,
            user:user
        });

        const validationError = portalData.validateSync();
        if (validationError) {
            res.render('portal-form.ejs', { message: 'Validation error, please check your input', title: 'Add request', log: req.session.userId });
            console.log(validationError);
        } else {
            const portalValues = await portalData.save();
            if (portalValues) {
                res.redirect('/')
            } else {
                res.render('portal-form.ejs', { message: 'Something went wrong, try again', title: 'Add request', log: req.session.userId });
            }
        }

    } catch (error) {
        res.render('message' , {message: 'something went wrong'})
    }
});

portal.get('/portal', async (req, res) => {
  try {
      // Define the filter object
      let filter = {};

      // Apply city filter if present
      if (req.query.city) {
          filter.city = req.query.city.toLowerCase(); // Convert city to lowercase
      }

      // Apply type filter if present
      if (req.query.type) {
          filter.type = req.query.type;
      }

      // Query MongoDB with filters
      const portalData = await Portal.find(filter);

      if (portalData.length > 0) {
          res.render('portal', { message: 'Welcome to request portal', portalData, moment });
      } else {
          res.render('portal', { message: 'No request available', portalData });
      }
  } catch (error) {
      res.render('message', { message: 'Something went wrong' });
  }
});
  portal.get('/portal/delete/:name', async (req, res) => {
    try {
      const userId = req.session.userId;
  
      // Find the mazdoor associated with the current user
      const portal = await Portal.findOne({ user: userId, username: req.params.name });
  
      if (!portal) {
        return res.status(404).render('message', { message:' portal not found for deletion' });
      }
      
  
      // Delete the mazdoor
      await Portal.findByIdAndDelete(portal._id);
  
      // Redirect or render a success message
      res.redirect('/profile')
    } catch (error) {
      console.error('Error:', error);
      res.render('message', { message: 'Something went wrong, try again' });
    }
  });

  portal.post('/add-comment', isLoggedIn, async (req, res) => {
    try {
        const cardId = req.body.cardId;
        const commentText = req.body.commentText;
        const userId = req.session.userId;
        const parentCommentId = req.body.parentCommentId; // New field for parent comment ID

        // Find the portal in MongoDB based on cardId
        const portal = await Portal.findById(cardId);

        if (!portal) {
            return res.status(404).send('Portal not found');
        }

        // Get the username of the commenting user
        const user = await User.findById(userId);
        const username = user ? user.username : 'Unknown'; // Use 'Unknown' if user not found

        // Create a new comment
        const newComment = new Comment({
            user: userId,
            username: username,
            text: commentText,
        });

        // Check if it's a reply to another comment
        if (parentCommentId) {
            const parentComment = portal.comments.id(parentCommentId);
            if (parentComment) {
                // Add the new comment as a reply to the parent comment
                parentComment.replies.push(newComment);
            } else {
                return res.status(404).send('Parent comment not found');
            }
        } else {
            // Add the comment to the portal's comments array
            portal.comments.push(newComment);
        }

        // Save both the comment and the updated portal
        await portal.save();

        // Render the portal page or send a response as needed
        res.render('portal', { message: 'Comment added successfully', portalData: [portal], moment });
    } catch (error) {
        console.error('Error adding comment or reply:', error);
        res.status(500).render('message', { message: 'Internal Server Error' });
    }
});

  
  // Add this endpoint in your backend code
  // Assuming you have a route for viewing comments with cardId
portal.get('/new-comment/:cardId', async (req, res) => {
    const cardId = req.params.cardId;
    // Fetch the portal and its comments based on cardId
    const portal = await Portal.findById(cardId).populate('comments.user replies.user', 'username');
    if (!portal) {
        return res.status(404).render('message', { message: 'Portal not found' });
    }

    // Render the new-comment.ejs page with portalData
    res.render('new-comment', { title: 'New Comment', portalData: [portal], moment, isLoggedIn });
});

portal.delete('/delete-comment/:commentId', isLoggedIn, async (req, res) => {
  const commentId = req.params.commentId;

  try {
      // Find the comment
      const portal = await Portal.findOneAndUpdate(
          { 'comments._id': commentId, 'comments.user': req.session.userId },
          { $pull: { comments: { _id: commentId } } },
          { new: true }
      );

      if (!portal) {
          return res.status(404).send({ error: 'Comment not found' });
      }

      // Respond with 204 No Content for successful deletion
      res.status(204).end();
  } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).send({ error: 'Internal Server Error', details: error.message });
  }
});


portal.get('/view-all-comments/:cardId', isLoggedIn, async (req, res) => {
  const cardId = req.params.cardId;

  try {
      // Fetch the portal and its comments based on cardId
      const portal = await Portal.findById(cardId).populate('comments.user', 'username');
      if (!portal) {
          return res.status(404).render('message', { message: 'Portal not found' });
      }

      // Render the new-comment.ejs page with portalData
      res.render('new-comment', { title: 'All Comments', portalData: [portal], moment, isLoggedIn });
  } catch (error) {
      console.error('Error fetching portal data:', error);
      res.status(500).render('message', { message: 'Internal Server Error' });
  }
});
module.exports = portal