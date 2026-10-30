
var express = require('express');
var health = express.Router();

const db = require('../db/dbConfig.js');


health.get("/health", async (req, res) => {
  try {
    await db.one("SELECT 1");          // pg-promise: expects exactly one row
    res.json({ status: "ok", db: "ok" });
  } catch (err) {
    console.error("Health check DB error:", err.message);
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});

module.exports = health;