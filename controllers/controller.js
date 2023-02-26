const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../models/model");

// Create new user
const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) return res.status(404).send("Ops, user already registered..!!");

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      const newUser = new User({
        username,
        email,
        password: hash,
      });
      await newUser.save();
      res.redirect("login");
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login page
const viewLoginPage = (req, res) => {
  res.render("login");
};

// Register page
const viewRegisterPage = (req, res) => {
  res.render("register");
};

// Protected profile page
const profilePage = (req, res) => {
  console.log(req);
  if (req.isAuthenticated()) {
    return res.render("profile", { req: req });
  }
  res.redirect("/login");
};

// Logout action
const signOut = (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const homePage = (req, res) => {
  res.render("index");
};
module.exports = { createUser, viewLoginPage, viewRegisterPage, profilePage, signOut, homePage };
