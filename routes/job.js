const express = require('express');
const Route = express.Router();
const Job = require('../models/job')
const moment = require('moment');
const isLoggedIn = require('../middleware/islogin');







Route.post('/addjobs', async (req, res) => {
    try {
        const user = req.session.userId || (req.user && req.user._id);

        const jobData = new Job({
            company: req.body.company,
            title: req.body.title,
            info: req.body.info,
            number: req.body.number,
            state: req.body.state === 'Other' ? req.body.otherState : req.body.state,
            otherState: req.body.otherState,
            address : req.body.address,
            user : user
           
        });

        const validationError = jobData.validateSync();
        if (validationError) {
            res.render('job-form.ejs', { message: 'Validation error, please check your input', title: 'Add jobs', log: req.session.userId });
            console.log(validationError);
        } else {
            const jobvalues = await jobData.save();
            if (jobvalues) {
                res.redirect('/jobs')
            } else {
                res.render('job-form.ejs', { message: 'Something went wrong, try again', title: 'Add jobs', log: req.session.userId });
            }
        }

    } catch (error) {
        res.render('message', { message: error });
    }
});



Route.get('/job-form', isLoggedIn,  async (req, res) => {
    res.render('job-form.ejs', { title: 'Add-job', message: 'Enter here jobInfo to user can interact to you', log : req.session.userId })
});


Route.get('/jobs', async (req, res) => {
    try {
        // Check if state filter is provided
        const stateFilter = req.query.state;

        // Use the stateFilter if provided, otherwise an empty object
        const filter = stateFilter ? { state: stateFilter } : {};

        const jobs = await Job.find(filter);

        res.render('job', {
            title: 'Jobs data',
            moment: moment,
            jobs: jobs,
            log: req.session.userId,
            req:req,
            stateFilter: stateFilter || '' // Set stateFilter to an empty string if undefined
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});


Route.get('/jobsfilter', async (req, res) => {
    try {
        // Check if state filter is provided
        const stateFilter = req.query.state;

        // Use the stateFilter if provided, otherwise an empty object
        const filter = stateFilter ? { state: stateFilter } : {};

        const jobs = await Job.find(filter);

        res.render('job', {
            title: 'Jobs data',
            moment: moment,
            jobs: jobs,
            log: req.session.userId,
            req:req,
            stateFilter: stateFilter || '' // Set stateFilter to an empty string if undefined
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = Route;