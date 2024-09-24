const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "UserName is required"],
    unique: [true, "UserName must be unique choose another one"],
  },
  password: {
    type: String,
    required: [true, "please anter a password"],
    minlength: 8,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const user = mongoose.model("user", userSchema);
module.exports = user;
