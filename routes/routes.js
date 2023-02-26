require("../config/passport");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const checkLoggedIn = require("../middleware/auth.middleware");
const {
  createUser,
  viewLoginPage,
  viewRegisterPage,
  profilePage,
  signOut,
  homePage,
} = require("../controllers/controller");

// Authentication operations (Bcrypt and passport local session)
router.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
      collectionName: "sessions",
    }),
  })
);
router.use(passport.initialize());
router.use(passport.session());

// POST routes
router.post("/register", createUser);
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login", successRedirect: "/profile" })
);

// GET routes
router.get("/", homePage);
router.get("/login", checkLoggedIn, viewLoginPage);
router.get("/register", viewRegisterPage);
router.get("/profile", profilePage); // This route is protected
router.get("/logout", signOut);

module.exports = router;
