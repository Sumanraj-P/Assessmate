import express from 'express';
const router = express.Router();

// Debug middleware for this router
router.use((req, res, next) => {
  console.log(`Admin Router - ${req.method} ${req.path}`);
  next();
});

// Add single student
router.post('/add-student', (req, res) => {
  console.log('POST /add-student hit');
  const { name, roll_no, year_of_study, department, college_name, mobile_no, email, password, user_role = 1 } = req.body;

  if (!name || !roll_no || !year_of_study || !department || !college_name || !mobile_no || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const checkQuery = 'SELECT email, roll_no FROM users WHERE email = ? OR roll_no = ?';
  
  req.db.query(checkQuery, [email, roll_no], (err, results) => {
    if (err) {
      console.error('Check duplicate error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length > 0) {
      const duplicate = results[0];
      if (duplicate.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      if (duplicate.roll_no === roll_no) {
        return res.status(400).json({ message: 'Roll number already exists' });
      }
    }

    const insertQuery = `
      INSERT INTO users (name, roll_no, year_of_study, department, college_name, 
                        mobile_no, email, password, user_role) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name, 
      roll_no, 
      parseInt(year_of_study), 
      department, 
      college_name, 
      mobile_no, 
      email, 
      password, 
      user_role
    ];

    req.db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('Insert student error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Duplicate entry found' });
        }
        return res.status(500).json({ message: 'Failed to add student' });
      }

      res.status(201).json({
        success: true,
        message: 'Student added successfully',
        studentId: result.insertId
      });
    });
  });
});

// Bulk upload students
router.post('/add-students-bulk', (req, res) => {
  console.log('POST /add-students-bulk hit');
  const { students } = req.body;

  if (!students || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: 'Invalid students data' });
  }

  const requiredFields = ['name', 'roll_no', 'year_of_study', 'department', 'college_name', 'mobile_no', 'email', 'password'];
  
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    for (let field of requiredFields) {
      if (!student[field]) {
        return res.status(400).json({ message: `Missing ${field} for student at row ${i + 1}` });
      }
    }
  }

  const insertQuery = `
    INSERT INTO users (name, roll_no, year_of_study, department, college_name, 
                      mobile_no, email, password, user_role) 
    VALUES ?
  `;

  const values = students.map(student => [
    student.name,
    student.roll_no,
    parseInt(student.year_of_study),
    student.department,
    student.college_name,
    student.mobile_no,
    student.email,
    student.password,
    student.user_role || 1
  ]);

  req.db.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error('Bulk insert error:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Duplicate entry found. Please check email addresses and roll numbers.' });
      }
      return res.status(500).json({ message: 'Failed to add students' });
    }

    res.status(201).json({
      success: true,
      message: `Successfully added ${result.affectedRows} students`,
      count: result.affectedRows
    });
  });
});

// Get students count
router.get('/students-count', (req, res) => {
  console.log('GET /students-count hit');
  const query = 'SELECT COUNT(*) as count FROM users WHERE user_role = 1';
  
  req.db.query(query, (err, results) => {
    if (err) {
      console.error('Count query error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.json({
      success: true,
      count: results[0].count
    });
  });
});

// Get students with pagination
router.get('/students', (req, res) => {
  console.log('GET /students hit');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const query = `
    SELECT id, name, roll_no, year_of_study, department, college_name, 
           mobile_no, email, created_at 
    FROM users 
    WHERE user_role = 1 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  req.db.query(query, [limit, offset], (err, results) => {
    if (err) {
      console.error('Students query error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const countQuery = 'SELECT COUNT(*) as total FROM users WHERE user_role = 1';
    req.db.query(countQuery, (countErr, countResults) => {
      if (countErr) {
        console.error('Count query error:', countErr);
        return res.status(500).json({ message: 'Internal server error' });
      }

      const total = countResults[0].total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        students: results,
        pagination: {
          currentPage: page,
          totalPages,
          totalStudents: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    });
  });
});

// Update student - THIS IS THE IMPORTANT ONE
router.put('/student/:id', (req, res) => {
  console.log(`\n!!! PUT /student/${req.params.id} HIT !!!`);
  console.log('Request body:', req.body);
  
  const { id } = req.params;
  const { name, roll_no, year_of_study, department, college_name, mobile_no, email, password } = req.body;

  // Validate required fields
  if (!name || !roll_no || !year_of_study || !department || !college_name || !mobile_no || !email) {
    return res.status(400).json({ message: 'All fields except password are required' });
  }

  // First check if the student exists
  const checkStudentQuery = 'SELECT id FROM users WHERE id = ? AND user_role = 1';
  
  req.db.query(checkStudentQuery, [id], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Check student exists error:', checkErr);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if email or roll_no already exists for other students
    const duplicateCheckQuery = `
      SELECT id FROM users 
      WHERE (email = ? OR roll_no = ?) 
      AND id != ? 
      AND user_role = 1
    `;

    req.db.query(duplicateCheckQuery, [email, roll_no, id], (dupErr, dupResults) => {
      if (dupErr) {
        console.error('Check duplicate error:', dupErr);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (dupResults.length > 0) {
        return res.status(400).json({ message: 'Email or roll number already exists' });
      }

      let updateQuery, values;

      if (password && password.trim()) {
        // Update with password
        updateQuery = `
          UPDATE users 
          SET name = ?, 
              roll_no = ?, 
              year_of_study = ?, 
              department = ?, 
              college_name = ?, 
              mobile_no = ?, 
              email = ?,
              password = ?
          WHERE id = ? AND user_role = 1
        `;
        values = [name, roll_no, parseInt(year_of_study), department, college_name, mobile_no, email, password, id];
      } else {
        // Update without password
        updateQuery = `
          UPDATE users 
          SET name = ?, 
              roll_no = ?, 
              year_of_study = ?, 
              department = ?, 
              college_name = ?, 
              mobile_no = ?, 
              email = ?
          WHERE id = ? AND user_role = 1
        `;
        values = [name, roll_no, parseInt(year_of_study), department, college_name, mobile_no, email, id];
      }

      req.db.query(updateQuery, values, (updateErr, result) => {
        if (updateErr) {
          console.error('Update student error:', updateErr);
          return res.status(500).json({ message: 'Failed to update student' });
        }

        console.log('Update successful, affected rows:', result.affectedRows);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Student not found or no changes made' });
        }

        res.json({
          success: true,
          message: 'Student updated successfully'
        });
      });
    });
  });
});

// Delete student
router.delete('/student/:id', (req, res) => {
  console.log(`DELETE /student/${req.params.id} hit`);
  
  const { id } = req.params;
  
  const query = 'DELETE FROM users WHERE id = ? AND user_role = 1';
  
  req.db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Delete student error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  });
});

// Search students
router.get('/search-students', (req, res) => {
  console.log('GET /search-students hit');
  const searchTerm = req.query.term || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  if (!searchTerm.trim()) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  // Use LIKE for partial matching with the search term
  const searchQuery = `
    SELECT id, name, roll_no, year_of_study, department, college_name, 
           mobile_no, email, created_at 
    FROM users 
    WHERE user_role = 1 
    AND name LIKE ? 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM users 
    WHERE user_role = 1 
    AND name LIKE ?
  `;

  const likeParam = `%${searchTerm}%`;
  
  req.db.query(searchQuery, [likeParam, limit, offset], (err, results) => {
    if (err) {
      console.error('Search query error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    req.db.query(countQuery, [likeParam], (countErr, countResults) => {
      if (countErr) {
        console.error('Count query error:', countErr);
        return res.status(500).json({ message: 'Internal server error' });
      }

      const total = countResults[0].total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        students: results,
        pagination: {
          currentPage: page,
          totalPages,
          totalStudents: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    });
  });
});

export default router;
