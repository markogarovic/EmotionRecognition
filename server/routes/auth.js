const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { registerValidation, loginValidation } = require("../config/validation");
// Loading User model
let User = require("../models/users");


// Register Proccess
router.post("/register", async function (req, res) {
  // Validation of request
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);


  // Create new user
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: hashedPassword,
    role: req.body.role || false,
  });

  // Check if user already exists in Database
  const usernameExist = await User.findOne({ username: req.body.username })
    .lean()
    .exec();
  if (usernameExist){
    
    return res.status(400).json({username:"Username already exists"});
    
  } 
  const emailExist = await User.findOne({ email: req.body.email })
    .lean()
    .exec();
  if (emailExist) return res.status(400).json({email:"Email already exists"});

  try {
    const savedUser = await newUser.save();
    // if(savedUser){
    //   return res.redirect("http://127.0.0.1:5500/html/login.html");
    // }
    return res.json({ user: savedUser._id, message: "User added to database" });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login Process
router.post("/login", async function (req, res, next) {
  // Validation of request
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ username: req.body.username })
    .lean()
    .exec();
  if (!user) return res.status(404).json({username: "Username doesn't exist"});

  // Match Password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).json({password:"Wrong password"});

  const accessToken = await jwt.sign(
    { _id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    // { expiresIn: "1d" }
  );
  // res.header("auth-token", accessToken);
  // const refreshToken = await jwt.sign(
  //   { _id: user._id },
  //   process.env.REFRESH_TOKEN_SECRET
  // );

  res.json({
    data: { username: user.username, role: user.role },
    accessToken: accessToken,
    // refreshToken: refreshToken,
  });
});

module.exports = router;
