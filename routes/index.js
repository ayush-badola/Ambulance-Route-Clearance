var express = require('express');
const axios = require('axios');
var router = express.Router();
const userModel = require("./users");
const passport = require("passport");

let hospitalstartingPoint;
let hospitaldestinationPoint;

const LocalStrategy = require("passport-local");
passport.use(userModel.createStrategy());



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
  //res.send("Home page working fine");
});



router.get("/hosp", function(req, res){
  res.render("hospitalinter");
});

router.post("/hosp", async function(req, res){
  hospitalstartingPoint = req.body.hospital_start;
  hospitaldestinationPoint = req.body.hospital_destination;
  res.redirect("/hospclr");
});


router.get("/userregister", function(req, res) {
  res.render("user_register_page");
  
});


router.post("/userregister", async function(req, res, next) {
  const name = (req.body.name);
  const email = req.body.email;
  const exist = await userModel.findOne({email: email});
  if(!exist){
  const userdata = new userModel({
    name: name,
    username: req.body.username,
    number: req.body.mobile,
    email: req.body.email
  });
  userModel.register(userdata, req.body.password)
.then(function() {
  passport.authenticate("local")(req, res, function () {
    res.redirect("/hosp");
  })

});
  }
  else{
    res.redirect("/userlogin");
  }
});


router.get("/userlogin", function(req, res){
  res.render("user_login_page");
});

router.post("/userlogin", 
passport.authenticate("local", {successRedirect: "/hosp",failureRedirect: "/userlogin"}),
 function(req, res, next) {
  
});


router.get("/logout", function (req, res, next){
  req.logout(function(err){
    if(err) {return next(err);}
    res.redirect("/login");
  });
});


router.get("/useryes", isLoggedIn,async function (req, res){
res.render("useryesamb", {name : req.user.name});
});

router.get("/userno", isLoggedIn,async function (req, res){
  res.render("usernoamb", {name : req.user.name});
  });

  router.get("/hospclr", isLoggedIn,async function (req, res){
    res.render("hospitalclear");
    });  


function isLoggedIn (req, res, next) {
  if(req.isAuthenticated()) {return next();}
  else {
  res.redirect("/userlogin");}
}



router.get("/user", function(req, res){
  res.render("userinter");
});


router.get("/", function(req, res) {
  res.render("routes");
  
});


router.post('/user', async (req, res) => {
    const userstartingPoint = req.body.user_start;
    const userdestinationPoint = req.body.user_destination;
    const user_loc = await axios.get(`https://apis.mapmyindia.com/advancedmaps/v1/79a5224bce9c08eff30184155c1d529a/route_adv/driving/${userstartingPoint};${userdestinationPoint}`);
    const userroute = user_loc.data.routes[0];
    const hospital_loc = await axios.get(`https://apis.mapmyindia.com/advancedmaps/v1/79a5224bce9c08eff30184155c1d529a/route_adv/driving/${hospitalstartingPoint};${hospitaldestinationPoint}`);
    const hospitalroute = hospital_loc.data.routes[0];

    compareGeometry(userroute.geometry, hospitalroute.geometry, res, req);
});

    function compareGeometry(geometry1, geometry2, res, req) {
      const polyline = require('polyline');

// Function to decode Polyline geometry
function decodePolyline(encodedGeometry) {
  console.log('Decoding geometry:', encodedGeometry);
  return polyline.decode(encodedGeometry);
}

// Fetch route geometries (replace with actual logic to get them from MapMyIndia API)
const route1Geometry = geometry1;
const route2Geometry = geometry2;

// Decode geometries
const route1Coordinates = decodePolyline(route1Geometry);
const route2Coordinates = decodePolyline(route2Geometry);





  const routesMatch = geometriesMatch(route1Coordinates, route2Coordinates);

if (routesMatch) {
  res.redirect("/useryes");
} else {
  res.redirect("/userno");
}

console.log('Decoded route 1 coordinates:', route1Coordinates); 
 console.log('Decoded route 2 coordinates:', route2Coordinates);

// Check if route coordinates are identical
function geometriesMatch(route1, route2) {
  for (let i = 0; i < route1.length; i++) {
    const coord1 = route1[i];
    for(let j=0; j<route2.length;j++){
      const coord2 = route2[j];
      if(coord1[0] === coord2[0] && coord1[1] === coord2[1])
      return true;
    }
  }
  return false;
}
}

module.exports = router;
