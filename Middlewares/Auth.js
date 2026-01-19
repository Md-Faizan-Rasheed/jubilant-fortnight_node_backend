// Middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
        return res.status(403).json({
            message: 'Unauthorized: JWT token is required',
        });
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded._id;
        next();
    } catch (err) {
        return res.status(403).json({
            message: 'Unauthorized: JWT token is invalid or expired',
        });
    }
};

module.exports = ensureAuthenticated;
