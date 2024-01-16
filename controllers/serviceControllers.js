const Service = require('../models/service');

const addService = async (req, res) => {
    try {
        const userId = req.session.userId;

        const services = new Service({
            organizationName: req.body.organizationName,
            contactNo: req.body.contactNo,
            type: req.body.type,
            address: req.body.address,
            about: req.body.about,
            image: req.files.map(file => file.filename),
            availability: req.body.availability,
            businessEmail: req.body.businessEmail,
            user: userId,
            city: req.body.city,
            state : req.body.state,
            otherState: req.body.otherState
        });

        const validationError = services.validateSync();
        if (validationError) {
            console.error(validationError);
            return res.render('service-form', { message: 'Validation error, please check your input', title: 'Add Service', log : req.session.userId });
        }

        const serviceValues = await services.save();
        if (serviceValues) {
            res.redirect('/services'); // Redirect to a services page or another appropriate route
        } else {
            res.render('service-form.ejs', { message: 'Something went wrong, try again', title: 'Add Service', log : req.session.userId });
        }
    } catch (error) {
        console.error('Error:', error);
        res.render('message', { message: 'An error occurred', title: 'Error' });
    }
};

module.exports = {
    addService,
};
