const express = require("express");
const { joinQueue, getQueueStatus, leaveQueue } = require("../controllers/queueController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:id/join", protect, joinQueue);
router.get("/:id/status", protect, getQueueStatus);
router.delete("/:id/leave", protect, leaveQueue);

module.exports = router;
