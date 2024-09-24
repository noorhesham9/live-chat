const Userr = require("../models/userModel.js");
const MessageModel = require("../models/messageModel.js");
const jwt = require("jsonwebtoken");
const CustomError = require("./../utils/CustomError");
const bcrypt = require("crypto-js");
const bcryptpass = require("bcryptjs");

require("dotenv").config();
const asyncErrorHandler = require("../utils/asynsErrorHandler.js");

const encryptData = (userToken, SECRET_KEY) => {
  if (userToken) {
    const encrypt = bcrypt.AES.encrypt(
      JSON.stringify({ userToken }),
      SECRET_KEY
    ).toString();
    return encrypt;
  } else {
    return;
  }
};

const decryptData = (encrypted, SECRET_KEY) => {
  const decrypted = bcrypt.AES.decrypt(encrypted, SECRET_KEY).toString(
    bcrypt.enc.Utf8
  );
  return JSON.parse(decrypted);
};

const signToken = (id, username) => {
  return jwt.sign({ userId: id, username }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

exports.test = asyncErrorHandler(async (req, res, next) => {
  res.status(201).cookie("test", "true").json("test");
});

exports.register = asyncErrorHandler(async (req, res, next) => {
  console.log("register =>");
  const createdUser = await Userr.create(req.body);
  const token = signToken(createdUser._id, createdUser.username);
  res.status(201).json({
    user: createdUser,
    token: encryptData(token, process.env.SECRET_KEY_TOKEN),
  });
});

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.jwt;
    if (token) {
      jwt.verify(token, process.env.SECRET_STR, {}, (err, userData) => {
        if (err) {
          next(new CustomError("there is an error login again", 401));
        } else {
          resolve(userData);
        }
      });
    } else {
      reject("no Token");
    }
  });
}

exports.getMessage = asyncErrorHandler(async (req, res, next) => {
  const { userID } = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;

  const messages = await MessageModel.find({
    sender: { $in: [userID, ourUserId] },
    recipient: { $in: [userID, ourUserId] },
  }).sort({ craetedAt: 1 });
  res.json(messages);
});
exports.login = asyncErrorHandler(async (req, res, next) => {
  const { username, password } = req.body;

  const foundUser = await Userr.findOne({ username });
  if (foundUser) {
    const passOk = bcryptpass.compareSync(password, foundUser.password);
    if (passOk) {
      const token = signToken(foundUser._id, foundUser.username);
      if (token) {
        res.cookie("jwt", token);
      }
      res.status(200).json({
        user: foundUser,
        token: encryptData(token, process.env.SECRET_KEY_TOKEN),
      });
    } else {
      next(new CustomError("email or password is not correct", 401));
    }
  } else {
    next(new CustomError("user is not found", 401));
  }
});

exports.logout = asyncErrorHandler(async (req, res, next) => {
  res.cookie("jwt", "", { sameSite: "none", secure: true }).json("ok");
});

exports.people = asyncErrorHandler(async (req, res, next) => {
  const users = await Userr.find({}, { _id: 1, username: 1 });
  res.json(users);
});

exports.profile = asyncErrorHandler(async (req, res, next) => {
  let token = req.cookies?.jwt;
  if (token) {
    jwt.verify(token, process.env.SECRET_STR, {}, async (err, userData) => {
      if (err) {
        next(new CustomError("there is an error login again", 401));
      } else {
        const user = await Userr.findOne({ _id: userData.userId });
        res.status(200).json(user);
      }
    });
  } else {
    next(new CustomError("there is no token", 401));
  }
});
