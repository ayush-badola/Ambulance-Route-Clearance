var express = require('express');
var router = express.Router();
var app = express();

const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/ambhack");


const user_schema = mongoose.Schema ({
  name: String,
  username: String,
  email : String,
  number: Number,
  password: String
})



user_schema.plugin(plm, {usernameField : "email"});
module.exports = mongoose.model("user",user_schema);