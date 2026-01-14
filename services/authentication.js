const JWT = require('jsonwebtoken');
require('dotenv').config();

function createTokenForUser(user) {
    const payload = {
        _id: user._id,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
    };

    const token = JWT.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    return token;
}

function validateToken(token) {
    const payload = JWT.verify(token, process.env.JWT_SECRET);
    return payload;
}

module.exports = {
    createTokenForUser,
    validateToken,
}