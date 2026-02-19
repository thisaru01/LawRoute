const Article = require('../models/articleModel');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// Create article
// - Admins: article is immediately published
// - Lawyers: article is created with status 'pending' and must be approved by admin
// Expects `req.user` populated by authentication middleware with fields: `_id`, `role`
const createArticle = async (req, res, next) => {
  try {
    console.log('createArticle called - body:', req.body);
    console.log('createArticle called - user:', req.user && { id: req.user._id, role: req.user.role });

    const { title, content, category } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const role = req.user.role;
    if (!['admin', 'lawyer'].includes(role)) {
      return res.status(403).json({ message: 'Only admins or lawyers can create articles' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const status = role === 'admin' ? 'published' : 'pending';

    const article = new Article({
      title,
      content,
      category,
      author: req.user._id,
      authorRole: role,
      status,
    });

    await article.save();
    console.log('article saved:', article._id, 'status:', article.status);

    const message = role === 'admin'
      ? 'Article published successfully.'
      : 'Article submitted for admin review.';

    return res.status(201).json({ message, article });
  } catch (err) {
    if (typeof next === 'function') return next(err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// Get all articles
// - Public: returns only published articles
// - Admin (with valid Bearer token): returns all articles
const getAllArticles = async (req, res, next) => {
  try {
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('role');
        if (user && user.role === 'admin') isAdmin = true;
      } catch (e) {
        // Invalid token - ignore and treat as unauthenticated
      }
    }

    const filter = {};
    // Status handling: allow admins to request any status via ?status=...
    if (req.query.status) {
      if (req.query.status !== 'published' && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      filter.status = req.query.status;
    } else if (!isAdmin) {
      filter.status = 'published';
    }

    if (req.query.category) filter.category = req.query.category;
    if (req.query.author) filter.author = req.query.author;

    const articles = await Article.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: articles.length, articles });
  } catch (err) {
    if (typeof next === 'function') return next(err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// export bottom of file (includes updateArticleStatus)

// Update article status (admin only)
const updateArticleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // strip angle brackets if client included them (e.g. <id>)
    const cleanId = String(id).replace(/[<>]/g, '');

    // validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(400).json({ success: false, message: 'Invalid article id' });
    }

    if (!['pending', 'published', 'rejected', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const article = await Article.findById(cleanId);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    article.status = status;
    await article.save();

    return res.status(200).json({ success: true, article });
  } catch (err) {
    if (typeof next === 'function') return next(err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

module.exports = { createArticle, getAllArticles, updateArticleStatus };
