const express = require("express");
const { getVenues, getVenueById } = require("../controllers/venueController");

const router = express.Router();

router.get("/", getVenues);
router.get("/:id", getVenueById);

module.exports = router;
