const express = require('express');
const router = express.Router();
const { createArticle, getAllArticles, updateArticleStatus } = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');

// Create article (admins publish immediately; lawyers create pending articles)
// Get all articles (public: only published; admin with token: all)
router.get('/', getAllArticles);

// Create article (admins publish immediately; lawyers create pending articles)
router.post('/', protect, createArticle);

// Admin-only: update article status (e.g. pending -> published)
router.patch('/:id/status', protect, (req, res, next) => require('../middleware/authMiddleware').authorizeRoles('admin')(req, res, (err) => { if (err) return next(err); next(); }), updateArticleStatus);

module.exports = router;
