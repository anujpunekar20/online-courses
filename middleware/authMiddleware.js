const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET); // Ensure this is correct
    
    const user = await User.findById(decoded.userId);
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      throw new Error();
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};