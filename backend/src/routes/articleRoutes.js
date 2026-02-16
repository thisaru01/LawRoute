const express = require('express');
const router = express.Router();
const { createArticle, getAllArticles } = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');

// Create article (admins publish immediately; lawyers create pending articles)
// Get all articles (public: only published; admin with token: all)
router.get('/', getAllArticles);

// Create article (admins publish immediately; lawyers create pending articles)
router.post('/', protect, createArticle);

module.exports = router;
