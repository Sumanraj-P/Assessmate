import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/flowcharts';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'flowchart-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Categories CRUD
router.post('/categories', (req, res) => {
  const { category_name } = req.body;

  if (!category_name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const query = 'INSERT INTO categories (category_name) VALUES (?)';
  
  req.db.query(query, [category_name], (err, result) => {
    if (err) {
      console.error('Error creating category:', err);
      return res.status(500).json({ success: false, message: 'Failed to create category' });
    }

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category_id: result.insertId
    });
  });
});

router.put('/categories/:id', (req, res) => {
  const { id } = req.params;
  const { category_name } = req.body;

  if (!category_name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const query = 'UPDATE categories SET category_name = ? WHERE category_id = ?';
  
  req.db.query(query, [category_name, id], (err, result) => {
    if (err) {
      console.error('Error updating category:', err);
      return res.status(500).json({ success: false, message: 'Failed to update category' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category updated successfully'
    });
  });
});

router.delete('/categories/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM categories WHERE category_id = ?';
  
  req.db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting category:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete category' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  });
});

// Subjects CRUD
router.post('/subjects', (req, res) => {
  const { subject_name, category_id } = req.body;

  if (!subject_name || !category_id) {
    return res.status(400).json({ success: false, message: 'Subject name and category ID are required' });
  }

  const query = 'INSERT INTO subjects (subject_name, category_id) VALUES (?, ?)';
  
  req.db.query(query, [subject_name, category_id], (err, result) => {
    if (err) {
      console.error('Error creating subject:', err);
      return res.status(500).json({ success: false, message: 'Failed to create subject' });
    }

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subject_id: result.insertId
    });
  });
});

router.put('/subjects/:id', (req, res) => {
  const { id } = req.params;
  const { subject_name } = req.body;

  if (!subject_name) {
    return res.status(400).json({ success: false, message: 'Subject name is required' });
  }

  const query = 'UPDATE subjects SET subject_name = ? WHERE subject_id = ?';
  
  req.db.query(query, [subject_name, id], (err, result) => {
    if (err) {
      console.error('Error updating subject:', err);
      return res.status(500).json({ success: false, message: 'Failed to update subject' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.json({
      success: true,
      message: 'Subject updated successfully'
    });
  });
});

router.delete('/subjects/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM subjects WHERE subject_id = ?';
  
  req.db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting subject:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete subject' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  });
});

// Topics CRUD
router.post('/topics', (req, res) => {
  const { topic_name, subject_id } = req.body;

  if (!topic_name || !subject_id) {
    return res.status(400).json({ success: false, message: 'Topic name and subject ID are required' });
  }

  const query = 'INSERT INTO topics (topic_name, subject_id) VALUES (?, ?)';
  
  req.db.query(query, [topic_name, subject_id], (err, result) => {
    if (err) {
      console.error('Error creating topic:', err);
      return res.status(500).json({ success: false, message: 'Failed to create topic' });
    }

    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      topic_id: result.insertId
    });
  });
});

router.put('/topics/:id', (req, res) => {
  const { id } = req.params;
  const { topic_name } = req.body;

  if (!topic_name) {
    return res.status(400).json({ success: false, message: 'Topic name is required' });
  }

  const query = 'UPDATE topics SET topic_name = ? WHERE topic_id = ?';
  
  req.db.query(query, [topic_name, id], (err, result) => {
    if (err) {
      console.error('Error updating topic:', err);
      return res.status(500).json({ success: false, message: 'Failed to update topic' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    res.json({
      success: true,
      message: 'Topic updated successfully'
    });
  });
});

router.delete('/topics/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM topics WHERE topic_id = ?';
  
  req.db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting topic:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete topic' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    res.json({
      success: true,
      message: 'Topic deleted successfully'
    });
  });
});

// Upload flowchart
router.post('/upload-flowchart', upload.single('flowchart'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  res.json({
    success: true,
    message: 'File uploaded successfully',
    filePath: '/' + req.file.path.replace(/\\/g, '/')
  });
});

export default router;

