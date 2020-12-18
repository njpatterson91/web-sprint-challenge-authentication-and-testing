const Auth = require("../auth/auth-model");

module.exports = (req, res, next) => {
  Auth.getByUsername(req.body.username)
    .then((username) => {
      console.log(username);
      if (username.length !== 0) {
        next();
      } else {
        res.status(401).json("invalid credentials");
      }
    })
    .catch((error) => {
      res.status(401).json(error.message);
    });
};
