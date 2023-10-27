// Made for verifying the token itself. This is used in the middleware/userRoutes.js file.
// Simo Sjögren

const jwt = require('jsonwebtoken');
const sessiontokens = require('../config/tokens_connection');

function verifyToken(req, res, next) {
  const username = req.body.username
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    console.log('Did not receive a token.')
    return res.status(401).json({ error: 'Unauthorized' });
  }
  sessiontokens.findOne({
    where: { id: username }
  }).then(retrievedToken => {
    if(!retrievedToken) {
      console.log('Did not find the token.')
      return res.status(403).json({ error: 'Unauthorized' });
    }
    console.log('Username found from the database.')
    // Token found from the database. Verify it.
    console.log(token)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      console.log('Token verified.')
      req.user = user;
      next();
    });
  }).catch(error => {
    console.log('ERROR: ' + error)
    return res.status(500).json({ error: 'Unknown error' });
  })
}

module.exports = verifyToken;
