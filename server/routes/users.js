const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../controllers/users');
const { authenticate } = require("../config/verifyToken");

router.put("/:username", authenticate, (req, res) => {
    const userName = req.params.username;
    if (req.body.password !== undefined) {
      throw "Invalid Password";
    }
    const queryToUpdate = req.body;
    try {
      function updateFields() {
        return User
          .update(userName, queryToUpdate)
          .then((user) => {
            res.status(204).json({
              data: user,
              message: "User has been updated",
            });
          })
          .catch((e) => {
            console.log(error);
            res.json(error);
          });
      }
      if (req.body.password === undefined) {
        updateFields();
        return;
      }
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err,
          });
        } else {
          req.body.password = hash;
          console.log("pass nakon hash", req.body.password);
          updateFields();
        }
      });
    } catch (error) {
      console.log(error);
      res.json(error);
    }
});
  
router.delete("/:username", async (req, res) => {
    const userName = req.params.username;
    try {
        const user = await User.delete(userName);
        res.status(204).json(user);
    } catch (error) {
        res.json(error);
    }
});
  
router.get("/:username", authenticate, async (req, res) => {
    const userName = req.params.username;
    try {
        const user = await User.findByUsername(userName);
        res.status(200).json({ user: user });
    } catch (error) {
        res.json(error);
    }
});
  
router.get("/all", async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.json(error);
    }
});

 

module.exports = router;