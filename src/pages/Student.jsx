import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Student = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.user_role === 1) {
        setUser(parsedUser);
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AssessMate Student</h1>
              <p className="text-gray-600">Welcome, {user.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full">
              <span className="text-2xl">🎓</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome, Student!</h2>
          <p className="text-lg text-gray-600 mb-8">
            Your student dashboard is coming soon. Stay tuned for exciting features!
          </p>
          
          {/* User Info Card */}
          <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Profile</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">Name: </span>
                <span className="text-gray-800">{user.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email: </span>
                <span className="text-gray-800">{user.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">User ID: </span>
                <span className="text-gray-800">{user.id}</span>
              </div>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📝</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Take Quizzes</h4>
              <p className="text-gray-600 text-sm">Access and complete assigned quizzes</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">View Results</h4>
              <p className="text-gray-600 text-sm">Check your quiz scores and performance</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-3xl mb-3">👤</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Profile</h4>
              <p className="text-gray-600 text-sm">Update your profile information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Student;