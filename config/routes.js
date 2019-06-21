const axios = require('axios');
const { authenticate } = require('../auth/authenticate');
const bcrypt = require('bcryptjs');
const secrets = require('../config/secrets.js');
const jwt = require('jsonwebtoken');
const Users = require('../users/user-model.js');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
 let user = req.body;

 const hash = bcrypt.hashSync(user.password, 10);
 user.password = hash;

 Users.add(user)
 .then(saved => {
   res.status(201).json(saved);
 })
 .catch(err => {
   res.status(500).json(err);
 })
}

function login(req, res) {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
          const token = generateToken(user);

          res.status(200).json({
              message: `Welcome ${user.username}!`,
              token,
          });
      } else {
          res.status(401).json({ message: 'Credentials not accepted'});
      }
  })
  .catch(err => {
      res.status(500).json(err);
  });
}

function generateToken(user) {
  const payload = {
      subject: user.id,
      username: user.username
  }
  const options = {
      expiresIn: '2d'
  }
  return jwt.sign(payload, secrets.jwtKey, options)
}


  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
