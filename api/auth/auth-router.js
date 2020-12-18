const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const Auth = require("./auth-model");
const freeUserName = require("../middleware/freeUserName");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../secrets/secrets");
const { validUserObject } = require("../middleware/validUserObject");
const validUserName = require("../middleware/validUserName");

router.post("/register", validUserObject, freeUserName, (req, res) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
  const credentials = req.body;

  const hash = bcryptjs.hashSync(credentials.password, 10);
  credentials.password = hash;

  Auth.insert(credentials).then((user) => {
    res.status(201).json(user);
  });
});

router.post("/login", validUserObject, validUserName, (req, res) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
  Auth.getByUsername(req.body.username).then((user) => {
    if (bcryptjs.compareSync(req.body.password, user[0].password)) {
      const token = makeToken(user[0]);
      res.status(200).json({
        message: "Welcome to our API, " + user[0].username,
        token,
      });
    } else {
      res.status(401).json("invalid credentials");
    }
  });
});

function makeToken(user) {
  // we use a lib called jsonwebtoken
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "900s",
  };
  return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;
