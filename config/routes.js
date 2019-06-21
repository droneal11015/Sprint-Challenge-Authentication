const axios = require('axios');
const db = require("../database/dbConfig.js")


const bcrypt = require("bcryptjs");
const { authenticate } = require('../auth/authenticate');
const jwt = require('jsonwebtoken');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};


function register(req, res) {

  user = req.body; 
  const password = bcrypt.hashSync(req.body.password);
  user.password = password; 

   db("users").insert(user)
    .then(() => res.status(200).json({message: "User successfully registered."}))
    .catch(() => res.status(500).json({errormessage: "Registration Error. Please try again."}))
}

function login(req, res) {

  const {username,password} = req.body;

  db("users").where({username}).then(
    user => {

      if(user && bcrypt.compareSync(password,user[0].password) )  {
        const token = generateToken(user);

        res.status(200).send(token);
      }
      else {
        res.status(401).json({errorMessage: "Credentials are not valid. Please try again."})
      }
    }  
  )
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

    axios
      .get('https://icanhazdadjoke.com/search', requestOptions)
      .then(response => {
      res.status(200).json(response.data.results);
      })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
  }



function generateToken(user) {
  const payload = {
    username: user.username,
    password: user.password 
  }

  const secretKey = "asdlfsahvanu*aelrjafasd(secretkey)*uavn"; 

  const signOptions = {
    expiresIn: "24h",
  }; 

  return jwt.sign(payload,secretKey,signOptions);
}