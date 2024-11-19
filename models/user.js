const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    require: [true, "Please provide email"],
    unique: true,
  },
  password: {
    type: String,
    require: [true, "Please provide password"],
  },
});

userSchema.pre("save", function (next) {
  const user = this;
  bcrypt
    .hash(user.password, 10)
    .then((hash) => {
      user.password = hash;
      next();
    })
    .catch((error) => {
      console.log(error);
    });
});

const User = mongoose.model("User", userSchema);
module.exports = User;
