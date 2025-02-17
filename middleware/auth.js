function isAuthenticated(req, res, next) {
    if (req.session.username) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

function isAdmin(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admins only' });
    }
}

module.exports = { isAuthenticated, isAdmin };