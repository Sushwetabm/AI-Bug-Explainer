const express = require("express");
const { userController } = require("../controllers");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/profile", auth(), userController.getUserProfile);

module.exports = router;
