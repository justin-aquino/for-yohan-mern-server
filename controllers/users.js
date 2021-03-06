const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../models");
// const requiresToken = require("../requiresToken");

// GET users
router.get("/", async (req, res) => {
  try {
    const foundUser = await db.Users.find({});
    res.json(foundUser);
  } catch (error) {
    console.log(err);
    res.status(503).json({ msg: `Server occured.` });
  }
});

// PUT user
router.put("/:id", async (req, res) => {
  try {
    if (req.body.password) {
      const salt = 12;
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPassword;
      console.log(req.body);
    }

    const updateUser = await db.Users.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    const users = await db.Users.find({});
    // res.json(updateUser)
    res.json(users);
  } catch (err) {
    console.log(err);
    res.send(503).json({ msg: "Server error : 503" });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    console.log("req params", req.params.id);
    const foundUser = await db.Users.findByIdAndDelete(req.params.id);
    res.status(204).json({ msg: "User Deleted" });
  } catch (err) {
    console.log(err);
    res.send(503).json({ msg: "Service error : 503" });
  }
});

//POST /users/register -- CREATE a new user
router.post("/register", async (req, res) => {
  try {
    // check if the user exists, dont allow to sign up again
    const userCheck = await db.Users.findOne({
      // $or: [{ email: req.body.email }, { username: req.body.username }],
      $or: [{ email: req.body.email }],
    });
    if (userCheck)
      return res.status(409).json({ msg: "Email/Username already in use." });

    // hash the pass
    const salt = 12;
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // create a user in the db
    const newUser = await db.Users.create({
      // username: req.body.username,
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: hashedPassword
    });

    // create a jwt payload to send back to the client
    const payload = {
      // username: newUser.username,
      email: newUser.email,
      id: newUser.id,
      // manager: newUser.manager,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
    };

    // sign the jwt and send it( log them in)
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 60 * 60,
    });
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(503).json({ msg: "server error 503" });
  }
});

// POST /user/login -- validate login credentials
router.post("/login", async (req, res) => {
  try {
    const foundUser = await db.Users.findOne({
      username: req.body.username,
    });

    if (!foundUser) return res.status(409).json({ msg: `User not found.` });

    if (!bcrypt.compareSync(req.body.password, foundUser.password)) {
      return res.status(406).json({ msg: "Invalid login credentials." });
    } else {
      const payload = {
        username: foundUser.username,
        email: foundUser.email,
        id: foundUser.id,
        manager: foundUser.manager,
        firstname: foundUser.firstname,
        lastname: foundUser.lastname,
      };
      const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 60 * 60,
      });
      res.json({ token });
    }
  } catch (err) {
    console.log(err);
    res.status(503).json({ msg: err });
  }
});

module.exports = router;
