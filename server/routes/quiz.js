import express from 'express';
const router = express.Router();

// Debug middleware for this router
router.use((req, res, next) => {
  console.log(`Quiz Router - ${req.method} ${req.path}`);
  next();
});

// Get all categories
router.get('/categories', (req, res) => {
  console.log('GET /categories hit');
  const query = 'SELECT * FROM categories ORDER BY category_name';
  
  req.db.query(query, (err, results) => {
    if (err) {
      console.error('Categories query error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.json({
      success: true,
      categories: results
    });
  });
});

// Get subjects by category
router.get('/subjects/:categoryId', (req, res) => {
  console.log(`GET /subjects/${req.params.categoryId} hit`);
  const { categoryId } = req.params;
  
  const query = 'SELECT * FROM subjects WHERE category_id = ? ORDER BY subject_name';
  
  req.db.query(query, [categoryId], (err, results) => {
    if (err) {
      console.error('Subjects query error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.json({
      success: true,
      subjects: results
    });
  });
});

// Get topics by subject
router.get('/topics/:subjectId', (req, res) => {
  console.log(`GET /topics/${req.params.subjectId} hit`);
  const { subjectId } = req.params;
  
  const query = 'SELECT * FROM topics WHERE subject_id = ? ORDER BY topic_name';
  
  req.db.query(query, [subjectId], (err, results) => {
    if (err) {
      console.error('Topics query error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.json({
      success: true,
      topics: results
    });
  });
});

// Create a new question
router.post('/questions', async (req, res) => {
  const {
    topic_id,
    question_type,
    question_text,
    option_A,
    option_B,
    option_C,
    option_D,
    correct_answer,
    flowchart_image,
    flowchart_answer
  } = req.body;

  try {
    const query = `
      INSERT INTO questions (
        topic_id,
        question_type,
        question_text,
        option_A,
        option_B,
        option_C,
        option_D,
        correct_answer,
        flowchart_image,
        flowchart_answer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      topic_id,
      question_type,
      question_text,
      question_type === 'MCQ' ? option_A : null,
      question_type === 'MCQ' ? option_B : null,
      question_type === 'MCQ' ? option_C : null,
      question_type === 'MCQ' ? option_D : null,
      question_type === 'MCQ' ? correct_answer : null,
      question_type === 'Flowchart' ? flowchart_image : null,
      question_type === 'Flowchart' ? correct_answer : null // Store flowchart answer here
    ];

    req.db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error creating question:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to create question',
          error: err.message 
        });
      }

      res.status(201).json({
        success: true,
        message: 'Question created successfully',
        question_id: result.insertId
      });
    });
  } catch (error) {
    console.error('Error in question creation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get questions by topic (optional - for viewing created questions)
router.get('/questions/:topicId', (req, res) => {
  console.log(`GET /questions/${req.params.topicId} hit`);
  const { topicId } = req.params;
  
  const query = `
    SELECT q.*, pq.language, pq.starter_code, pq.expected_output 
    FROM questions q 
    LEFT JOIN programming_questions pq ON q.question_id = pq.question_id 
    WHERE q.topic_id = ? 
    ORDER BY q.created_at DESC
  `;
  
  req.db.query(query, [topicId], (err, results) => {
    if (err) {
      console.error('Questions query error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.json({
      success: true,
      questions: results
    });
  });
});

// Get a specific question by ID
router.get('/questions/:id', (req, res) => {
  const query = `
    SELECT 
      q.*,
      CASE 
        WHEN q.question_type = 'MCQ' THEN q.correct_answer
        WHEN q.question_type = 'Flowchart' THEN q.flowchart_answer
      END as answer
    FROM questions q
    WHERE q.question_id = ?
  `;

  req.db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching question:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch question' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({
      success: true,
      question: results[0]
    });
  });
});

export default router;