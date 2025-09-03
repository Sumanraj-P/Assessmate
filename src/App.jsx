import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Student from './pages/Student';
import Home from './Home';
import Layout from './components/Layout';
import 'notyf/notyf.min.css'; // Import Notyf styles globally

function App() {
  return (
    <Router>
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/student" element={<Student />} />
          </Routes>
        </div>
      </Layout>
    </Router>
  );
}

export default App;