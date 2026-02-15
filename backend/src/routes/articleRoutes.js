const express = require('express');
const router = express.Router();
const { createArticle } = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');

// Create article (admins publish immediately; lawyers create pending articles)
router.post('/', protect, createArticle);

module.exports = router;
