const User = require("../models/user");

module.exports = (req, res) => {
  User.create(req.body)
    .then(() => {
      console.log("Register successfully");
      res.redirect("/");
    })
    .catch((error) => {
      console.log(error);
    });
};
