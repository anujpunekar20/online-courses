const express = require("express");
const Router = express.Router();

Router.get("/", (req, res) => {
  res.json("welcome to the API");
});

module.exports = Router;