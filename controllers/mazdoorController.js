const Mazdoor = require('../models/mazdoor');

const addMazdoor = async (req, res) => {
    try {
        // ... other code ...
        const userId = req.session.userId;

        const mazdoor = new Mazdoor({
            username: req.body.username,
           phoneNumber: req.body.phoneNumber,
            type: req.body.type,
            address: req.body.address,
            about: req.body.about,
            image : req.file.filename,
            user : userId,
            city : req.body.city,
            state : req.body.state,
            otherState: req.body.otherState
        });

        const validationError = mazdoor.validateSync();
        if (validationError) {
            res.render('mazdoor-form.ejs', { message: 'Validation error, please check your input', title: 'Add Mazdoor', log : req.session.userId });
            console.log(validationError)
        } else {
            const mazdoorvalues = await mazdoor.save();
            if (mazdoorvalues) {
                res.render('mazdoor', { title: 'You are successfully added', log : req.session.userId });
            } else {
                res.render('mazdoor-form.ejs', { message: 'Something went wrong, try again', title: 'Add Mazdoor', log : req.session.userId });
            }
        }
    } catch (error) {
        console.log('Error:', error);
    }
};


module.exports = {
    addMazdoor
};
