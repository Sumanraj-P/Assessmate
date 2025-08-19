import express from 'express';
const router = express.Router();

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT id, name, email, user_role FROM users WHERE email = ? AND password = ?';
  
  req.db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Login query error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_role: user.user_role
      }
    });
  });
});

// Get user profile
router.get('/profile/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT id, name, email, roll_no, year_of_study, department, 
           college_name, mobile_no, user_role, created_at 
    FROM users WHERE id = ?
  `;
  
  req.db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Profile query error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: results[0]
    });
  });
});

export default router;
