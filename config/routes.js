const axios = require('axios');

const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  let user = req.body;
    if (!user.username || !user.password) {
        return res.status(500).json({message: 'Must provide username and password'});
    }

    if (user.password.length < 0) {
        return res.status(400).json({message:'Please enter a password'})
    }

    const hash = bcrypt.hashSync(user.password, 10);

    user.password = hash;

    User.add(user)
    .then(saved => {
        res.status(201).json(saved);
    })
    .catch(error => {
        res.status(500).json({message: 'An error occurred trying to register. Please try again.'})
    });
}

function login(req, res) {
  let { username, password } = req.body;
  
  User.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) 
  {
      req.session.user = user;
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json({message: 'Error logging in, please try again!'});
    });
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
