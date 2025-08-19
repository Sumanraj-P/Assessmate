import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AddStudents from './pages/AddStudents';
import Student from './pages/Student';
import Home from './Home';
import QuizCreationPage from './pages/QuizCreation';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/add-students" element={<AddStudents />} />
          <Route path="/student" element={<Student />} />
          <Route path="/admin/quiz-creation" element={<QuizCreationPage/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;