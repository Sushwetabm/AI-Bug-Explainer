const express = require("express");
const authRoutes = require("./auth");
const analysisRoutes = require("./analysis");
const userRoutes = require("./user");
const auth = require("../middleware/auth");

const router = express.Router();

router.use("/auth", authRoutes);
// router.use("/analysis", [auth(), analysisRoutes]);
// router.use("/user", [auth(), userRoutes]);
router.use("/user", auth(), userRoutes);
router.use("/analysis", auth(), analysisRoutes);
// Optional lightweight token‑check endpoint
router.get("/auth/validate", auth(), (req, res) => {
  res.status(200).json({ ok: true });
});

module.exports = router;
