const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config({ path: "./config/.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

const post = require("./Routes/post");
const user = require("./Routes/user");

app.get("/", (req, res) => {
  res.send("Api is Working");
});

app.use("/api/v1", post);
app.use("/api/v1", user);

module.exports = app;
