const isLoggedIn = (req, res, next) => {
    // Check if the user is authenticated (logged in)
    if (req.session && (req.session.userId || req.user)) {
        req.loggedInUserId = req.session.userId;
        next();
    } else {
        // User is not logged in, redirect to the login page or handle accordingly
        res.redirect('/login')
    }
};

module.exports = isLoggedIn;