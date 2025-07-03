const express = require("express");
const { userController } = require("../controllers");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth(), userController.getCurrentUser);

module.exports = router;
