// Made for verifying the token itself. This is used in the middleware/userRoutes.js file.
// Simo Sjögren

const jwt = require('jsonwebtoken');
const sessiontokens = require('../config/tokens_connection');

function verifyToken(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    console.log('Did not receive a token.')
    return res.status(403).json({ error: 'Unauthorized' });
  }
  sessiontokens.findOne({
    where: { id: req.body.username }
  }).then(retrievedToken => {
    if(!retrievedToken) {
      console.log('Did not find the token.')
      return res.status(403).json({ error: 'Unauthorized' });
    }
    console.log('Username found from the database.')
    // Token found from the database. Verify it.
    console.log(token)
    console.log(retrievedToken.dataValues.token)
    if (token === retrievedToken.dataValues.token) {
      // This authentication method is not the best, but it works for now.
      // TODO: Change this to JWT.
      console.log('Token verified.')
      req.body.username = retrievedToken.dataValues.id;
      next();
    } else {
      console.log('Token verification failed.')
      return res.status(403).json({ error: 'Unauthorized' });
    }
  }).catch(error => {
    console.log('ERROR: ' + error)
    return res.status(500).json({ error: 'Unknown error' });
  })
}

module.exports = verifyToken;
