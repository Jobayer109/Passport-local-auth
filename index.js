require("dotenv").config();
require("./config/passport");
const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/db");
const app = express();
const port = process.env.PORT || 8080;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Authentication operations (Bcrypt and passport local session)
const bcrypt = require("bcrypt");
const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://mongooseUser:GzvKCFv3FBrYIPDv@cluster0.ijchsof.mongodb.net/Passport_DB",
      collectionName: "sessions",
    }),
    // cookie: { secure: true },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) return res.status(400).send("user already exists");

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
});

// Login
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login", successRedirect: "/profile" })
);

// routes
app.get("/", (req, res) => {
  res.render("index");
});

const checkLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  }
  next();
};

app.get("/login", checkLoggedIn, (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

// profile protected route
app.get("/profile", (req, res) => {
  // res.render("profile");
  if (req.isAuthenticated()) {
    return res.render("profile");
  }
  res.redirect("/login");
});

// log out
app.get("/logout", (req, res) => {
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
});

// server run
const start = async () => {
  try {
    await dbConnect(
      "mongodb+srv://mongooseUser:GzvKCFv3FBrYIPDv@cluster0.ijchsof.mongodb.net/Passport_DB"
    );
    app.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}`);
    });
  } catch (error) {
    res.status(500).send("Server crushed. Something went wrong with server.");
  }
};
start();
