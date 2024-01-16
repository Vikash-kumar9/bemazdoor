const express = require('express');
const service = express.Router();
const Service = require('../models/service')
const moment = require('moment');
const multer = require('multer');
const { addService } = require('../controllers/serviceControllers');
const isLoggedIn = require('../middleware/islogin');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    }
  });
  
  
  var upload = multer({
    storage: storage
  }).array('image', 5);
  

  service.use(express.static('./uploads'));


service.get('/Services', async ( req, res) => {
    try {
        res.render('services', { title: "services",  log : req.session.userId})
    } catch (error) {
        res.send(error)
    }
    
});



  

service.get('/service', async (req, res) => {
  try {
    const filter = {};

    // Apply city filter if present
    if (req.query.city) {
      filter.city = req.query.city.toLowerCase(); // Convert city to lowercase
    }

    // Apply service type filter if present
if (req.query.type) {
  filter.type = req.query.type.toLowerCase(); // Convert type to lowercase
}

    const services = await Service.find(filter);

    res.render('service', { 
      title: 'Services',
      services,
      moment,
      log: req.session.userId,
      req: req
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

service.get('/service/:typ', async (req, res) => {
  try {
    const filter = {};

    // Apply city filter if present
    if (req.query.city) {
      filter.city = req.query.city;
    }

    const services = await Service.find({ ...filter , type:req.params.typ});
    res.render('service', {
      title: 'service',
      moment : moment,
      req:req,
     
     services : services,
      log : req.session.userId
     
    })

  } catch (err) {
    console.log(err);
  }
});



service.get('/service-form',isLoggedIn, async ( req, res ) => {
    try {
        res.render('service-form', { title: 'service-form', message:'enter correct credentials bcz it help user to interact with you', log : req.session.userId})
    } catch (error) {
        res.send(error)
    }
});

service.post('/addService',upload, addService);

// Assuming you have a route for deleting services
service.get('/services/delete/:name', async (req, res) => {
  try {
    const userId = req.session.userId;

    // Find the service associated with the current user
    const service = await Service.findOne({ user: userId, organizationName: req.params.name });

    if (!service) {
      return res.status(404).render('message', { message: 'Service not found for deletion' });
    }

    // Delete the service
    await Service.findByIdAndDelete(service._id);

    // Redirect or render a success message
    res.redirect('/profile')
  } catch (error) {
    console.error('Error:', error);
    res.render('message', { message: 'Something went wrong, try again' });
  }
});






module.exports = service;