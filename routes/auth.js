const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const { validationResult, body } = require("express-validator");
const fetchuser = require("../middlewares/fetchuser");

//ROUTE 1: Create new user using POST:"/api/auth/createUser"
router.post(
  "/createUser",
  [
    body("name")
      .isLength({ min: 5 })
      .withMessage("name must have 5 characters")
      .notEmpty()
      .withMessage("username empty"),
    body("email").isEmail().withMessage("not a valid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("password must have 8 characters"),
  ],
  async (req, res) => {
    let success = false;
    const result = validationResult(req);
    //Shows error and bad request if there is any..
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    try {
      //Check whether the user with same email is already exist or not
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success,
          error: "Sorry, a user with this email already exist..",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      //Create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, process.env.JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.log(error);
      res.status(500).send("Some error occured");
    }
  }
);

//ROUTE 2: login user without login  POST:"/api/auth/login"
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("not a valid email"),
    body("password").exists().withMessage("Password cannot be blank"),
  ],
  async (req, res) => {
    let success = false;
    const result = validationResult(req);
    //Shows error and bad request if there is any..
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    try {
      const { email, password } = req.body;
      let user = await User.findOne({ email: email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to login with correct credentials",
        });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, process.env.JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error..");
    }
  }
);

//ROUTE 3: Get loggedin user details POST:"/api/auth/getuser"
router.get("/getuser", fetchuser, async (req, res) => {
  let success = true;
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.json({ success, user });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error..");
  }
});
module.exports = router;
