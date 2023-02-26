require("dotenv").config();
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

// Routes
app.use("/", require("./routes/routes"));

// server run
const start = async () => {
  try {
    await dbConnect(process.env.DB_URL);
    app.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}`);
    });
  } catch (error) {
    res.status(500).send("Server crushed. Something went wrong with server.");
  }
};
start();
