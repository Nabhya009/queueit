const express = require("express");
const { getQueueDetail, serveNext, skipNext, togglePause } = require("../controllers/adminController");
const { protect, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Applied once for the whole router, rather than per-route, since every
// admin action requires the same "logged in AND admin" check.
router.use(protect, requireAdmin);

router.get("/queues/:id", getQueueDetail);
router.patch("/queues/:id/serve", serveNext);
router.patch("/queues/:id/skip", skipNext);
router.patch("/queues/:id/pause", togglePause);

module.exports = router;
