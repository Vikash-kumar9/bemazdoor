require('dotenv').config();

const express = require('express');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const router = require("./routes/routes");
const User = require('./models/User');

const db = require('./db');
const { mazdoorRouter }  = require('./routes/mazdoor');
const service = require('./routes/service');
const isLoggedIn = require('./middleware/islogin');
const moment = require('moment')
const mongoose = require('mongoose');
const Route = require('./routes/job');
const portal = require('./routes/portal');



const PORT = process.env.PORT || 4000;


const app = express()


app.use(
  session({
      secret: 'this-is-damm-seceret-500', // Change this to a random and secure string
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true } // Set secure to true in a production environment with HTTPS
  })
);



app.set("view engine", "ejs");

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/', Route);

app.use('/', router);

app.use('/', mazdoorRouter);

app.use('/', service);

app.use( '/' , portal);

app.use(express.static('./public'));
app.use(express.static('./uploads'));





app.get("/", (req, res) => {
  res.render('pindex', { title: 'Home' , log : req.session.userId});
})




app.get('/profile',isLoggedIn, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.userId);

    const userAggregate = await User.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: 'user',
          as: 'services'
        }
      },
      {
        $lookup: {
          from: 'mazdoors',
          localField: '_id',
          foreignField: 'user',
          as: 'mazdoors'
        }
      },{
      $lookup : {
        from: 'portals',
        localField: '_id',
        foreignField: 'user',
        as: 'portals'
      }}
    ]);

    const user = userAggregate[0];

    if (!user) {
      return res.status(404).render('message', { message: 'User not found' });
    }

    return res.render('profile', {
      title: user.username,
      user: user,
      services: user.services,
      mazdoors: user.mazdoors,
      portalData: user.portals,
      moment: moment,
       log : req.session.userId
    });
  } catch (err) {
    console.error('Error fetching user data:', err);
    return res.status(500).render('message', { message: 'Internal Server Error' });
  }
});





app.get('/signUp', (req, res) => {
  res.render('form')
});

app.get('/login', (req, res) => {
  res.render('login', { message: "Insert your correct credentials here" })
});

app.get('/logout', (req,res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error clearing session:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.redirect('/'); // Redirect to the home page or any desired destination after logout
  })
});


app.get('/verify/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;
      const user = await User.findById(userId);

      if (user) {
          user.is_verified = true;
          await user.save();
          res.render('message', { title: 'Verification Success' });
      } else {
          res.render('message', { title: 'Verification Failure' });
      }
  } catch (error) {
      console.error('Error during email verification:', error);
      res.status(500).render('message', { message: 'Internal Server Error' });
  }
});

app.get('/terms', async (req,res) =>{
res.render('Terms&conditions')
});

app.get('/privacy' , async(req,res)=>{
  res.render('privacy')
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});