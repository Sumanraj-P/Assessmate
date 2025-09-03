import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

const PublishQuiz = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [publishType, setPublishType] = useState('class'); // 'class' or 'individual'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeLimit, setTimeLimit] = useState(60); // in minutes

  useEffect(() => {
    // Check auth
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.user_role === 0) {
        setUser(parsedUser);
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }

    // Fetch quizzes, students, and classes
    fetchQuizzes();
    fetchStudents();
    fetchClasses();
  }, [navigate]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/quiz/all`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/classes`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    // Reset selected students when class changes
    setSelectedStudents([]);
  };

  const handleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedQuiz) {
      setFormError('Please select a quiz');
      return;
    }
    
    if (publishType === 'class' && !selectedClass) {
      setFormError('Please select a class');
      return;
    }
    
    if (publishType === 'individual' && selectedStudents.length === 0) {
      setFormError('Please select at least one student');
      return;
    }
    
    if (!startDate || !endDate) {
      setFormError('Please set both start and end dates');
      return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
      setFormError('End date must be after start date');
      return;
    }
    
    // Clear errors
    setFormError('');
    setLoading(true);
    
    try {
      const publishData = {
        quiz_id: selectedQuiz,
        start_date: startDate,
        end_date: endDate,
        time_limit: timeLimit,
        published_by: user.id
      };
      
      if (publishType === 'class') {
        publishData.class_id = selectedClass;
      } else {
        publishData.student_ids = selectedStudents;
      }
      
      const response = await fetch(`${API_BASE_URL}/quiz/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(publishData)
      });
      
      if (response.ok) {
        setSuccessMessage('Quiz published successfully!');
        // Reset form
        setSelectedQuiz('');
        setSelectedClass('');
        setSelectedStudents([]);
        setStartDate('');
        setEndDate('');
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || 'Failed to publish quiz');
      }
    } catch (error) {
      console.error('Error publishing quiz:', error);
      setFormError('An error occurred while publishing the quiz');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-5xl w-full">

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span className="text-sm sm:text-base">{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-green-700">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span className="text-sm sm:text-base">{formError}</span>
          <button onClick={() => setFormError('')} className="text-red-700">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Select Quiz
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a quiz...</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Publish To
            </label>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="publishType"
                  value="class"
                  checked={publishType === 'class'}
                  onChange={() => setPublishType('class')}
                  disabled={loading}
                />
                <span className="ml-2 text-sm sm:text-base">Entire Class</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="publishType"
                  value="individual"
                  checked={publishType === 'individual'}
                  onChange={() => setPublishType('individual')}
                  disabled={loading}
                />
                <span className="ml-2 text-sm sm:text-base">Individual Students</span>
              </label>
            </div>
          </div>

          {publishType === 'class' ? (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Select Class
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selectedClass}
                onChange={handleClassChange}
                disabled={loading}
              >
                <option value="">Select a class...</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Select Students
              </label>
              <div className="max-h-60 overflow-y-auto border rounded p-2 border-gray-300">
                {students.length === 0 ? (
                  <p className="text-gray-500 text-sm py-2">No students available</p>
                ) : (
                  students.map((student) => (
                    <div key={student.id} className="py-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox text-blue-600 rounded"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleStudentSelection(student.id)}
                          disabled={loading}
                        />
                        <span className="ml-2">{student.name} ({student.email})</span>
                      </label>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {selectedStudents.length} student(s) selected
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
              min="1"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish Quiz'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default PublishQuiz;
