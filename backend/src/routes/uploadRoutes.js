const express = require("express");
const { uploadAsset } = require("../controllers/uploadController");
const { protectAdmin, authorizePermissions } = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/uploadMiddleware");
const { PERMISSIONS } = require("../utils/permissions");

const router = express.Router();

router.post("/image", protectAdmin, authorizePermissions(PERMISSIONS.MEDIA_UPLOAD), uploadImage.single("image"), uploadAsset);

module.exports = router;
