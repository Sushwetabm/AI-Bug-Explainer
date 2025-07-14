// const express = require("express");
// const { userController } = require("../controllers");
// const auth = require("../middleware/auth");

// const router = express.Router();

// router.get("/me", auth(), userController.getCurrentUser);
// router.put("/update", auth(), userController.updateProfile);

// module.exports = router;

//-------------------------------------------------------------------------------
const express = require("express");
const { userController } = require("../controllers");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
router.get("/me", auth(), userController.getCurrentUser);

/**
 * @swagger
 * /user/update:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put("/update", auth(), userController.updateProfile);

module.exports = router;

//SWAGGER REMOVED VERSION
// const express = require("express");
// const { userController } = require("../controllers");
// const auth = require("../middleware/auth");

// const router = express.Router();

// // Get current user profile
// router.get("/me", auth(), userController.getCurrentUser);

// // Update user profile
// router.put("/update", auth(), userController.updateProfile);

// module.exports = router;
