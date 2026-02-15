const Article = require('../models/articleModel');

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

module.exports = { createArticle };
