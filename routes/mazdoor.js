const express = require('express');
const mazdoorRouter = express.Router();
const User = require('../models/User')
const Mazdoor = require('../models/mazdoor')
const multer = require('multer');
const { addMazdoor,  } = require('../controllers/mazdoorController');
const moment = require('moment');

mazdoorRouter.use(express.static('./public'));


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    }
  });
  
  
  
  
  
  var upload = multer({
    storage: storage,
  }).single('image');
  

// Define the route for adding mazdoor using the POST method
mazdoorRouter.post('/add-mazdoor',upload, addMazdoor);


mazdoorRouter.get('/mazdoor', (req, res) => {
    res.render('mazdoor', { title: " Mazdoor", log : req.session.userId })
});

mazdoorRouter.get('/add-mazdoor', async (req, res) => {
    try {
        const userId = req.session.userId;
        if(userId)
        {
            const user = await User.findById(userId);
            if(user) {
                res.render('mazdoor-form', { title: 'add-mazdoor', message: 'add your card info that other users can intract you', user: user, log : req.session.userId})
            }
            else{
                res.render('message' , {message: 'user not found'})
            }
        }
        else {
            res.render('login' , { message : 'login required'});
        }
    } catch (error) {
        console.log(error)
    }
   
});


  
  
  
  
  mazdoorRouter.get('/mazdoor/delete/:name', async (req, res) => {
    try {
      const userId = req.session.userId;
  
      // Find the mazdoor associated with the current user
      const mazdoor = await Mazdoor.findOne({ user: userId, username: req.params.name });
  
      if (!mazdoor) {
        return res.status(404).render('message', { message: 'Mazdoor not found for deletion' });
      }
      
  
      // Delete the mazdoor
      await Mazdoor.findByIdAndDelete(mazdoor._id);
  
      // Redirect or render a success message
      res.redirect('/profile')
    } catch (error) {
      console.error('Error:', error);
      res.render('message', { message: 'Something went wrong, try again' });
    }
  });
  

  mazdoorRouter.get('/mazdoorall', async (req, res) => {
    try {
        const filter = {};

        // Apply city filter if present
        if (req.query.city) {
            filter.city = req.query.city.toLowerCase(); // Convert city to lowercase
        }

        // Apply job type filter if present
        if (req.query.type) {
            filter.type = req.query.type;
        }

        const mazdoor = await Mazdoor.find(filter);

        res.render('Nmazdoor', {
            title: 'Mazdoor',
            mazdoor,
            moment,
            log: req.session.userId,
            req: req
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
  
mazdoorRouter.get('/users/:typ', async (req, res) => {
  try {
    const filter = {};

    // Apply city filter if present
    if (req.query.city) {
      filter.city = req.query.city;
    }

    // Fetch data from the database based on the applied filters
    const mazdoor = await Mazdoor.find({ ...filter, type: req.params.typ });

    // Render your view with the filtered data
    res.render('Nmazdoor', {
      title: 'mazdoors',
      mazdoor,
      moment,
      log: req.session.userId, // Assuming you have a user session
      req: req
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
 

module.exports = {
    mazdoorRouter,
};
