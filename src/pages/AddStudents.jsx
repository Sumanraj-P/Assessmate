import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';


const AddStudents = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [studentsCount, setStudentsCount] = useState(0);
  const navigate = useNavigate();

  // Manual form state
  const [manualForm, setManualForm] = useState({
    name: '',
    roll_no: '',
    year_of_study: '',
    department: '',
    college_name: '',
    mobile_no: '',
    email: '',
    password: ''
  });

  // Excel upload state
  const [excelData, setExcelData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Add new state for students list and pagination
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userData);
    if (user.user_role !== 0) {
      navigate('/login');
      return;
    }

    fetchStudentsCount();
    fetchStudents();
  }, [navigate, currentPage]);

  // Update fetchStudentsCount function
  const fetchStudentsCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students-count');
      const data = await response.json();
      if (response.ok) {
        setStudentsCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching students count:', error);
    }
  };

  // Update fetchStudents function
  const fetchStudents = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/students?page=${currentPage}&limit=10`);
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.students);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleManualChange = (e) => {
    setManualForm({
      ...manualForm,
      [e.target.name]: e.target.value
    });
  };

  // Update handleManualSubmit function
  const handleManualSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');

  try {
    // Prepare the data
    const submitData = {
      name: manualForm.name.trim(),
      roll_no: manualForm.roll_no.trim(),
      year_of_study: parseInt(manualForm.year_of_study, 10),
      department: manualForm.department.trim(),
      college_name: manualForm.college_name.trim(),
      mobile_no: manualForm.mobile_no.trim(),
      email: manualForm.email.trim(),
      password: manualForm.password.trim(),
      user_role: 1
    };

    const response = await fetch('http://localhost:5000/api/add-student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData)
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add student');
    }

    setMessage({ 
      type: 'success', 
      text: 'Student added successfully!' 
    });

    // Reset form
    setManualForm({
      name: '',
      roll_no: '',
      year_of_study: '',
      department: '',
      college_name: '',
      mobile_no: '',
      email: '',
      password: ''
    });
    
    // Refresh data
    await fetchStudents();
    await fetchStudentsCount();

  } catch (error) {
    console.error('Submit error:', error);
    setMessage({ 
      type: 'error', 
      text: error.message || 'Failed to add student' 
    });
  } finally {
    setLoading(false);
  }
};

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate required columns
        const requiredColumns = ['name', 'roll_no', 'year_of_study', 'department', 'college_name', 'mobile_no', 'email', 'password'];
        if (jsonData.length > 0) {
          const fileColumns = Object.keys(jsonData[0]);
          const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));
          
          if (missingColumns.length > 0) {
            setMessage({ 
              type: 'error', 
              text: `Missing required columns: ${missingColumns.join(', ')}`
            });
            return;
          }
        }

        setExcelData(jsonData);
        setMessage({ type: 'success', text: `${jsonData.length} students loaded from Excel file` });
      } catch (error) {
        setMessage({ type: 'error', text: 'Error reading Excel file. Please check the format.' });
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleBulkUpload = async () => {
    if (excelData.length === 0) {
      setMessage({ type: 'error', text: 'Please upload an Excel file first' });
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Add user_role: 1 to all students
      const studentsWithRole = excelData.map(student => ({ ...student, user_role: 1 }));
      console.log('Uploading students:', studentsWithRole);
      const response = await fetch('http://localhost:5000/api/add-students-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ students: studentsWithRole })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Successfully added ${data.count} students!` 
        });
        setExcelData([]);
        setSelectedFile(null);
        fetchStudentsCount(); // Update count
        fetchStudents(); // Update students list
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add students' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      ...student,
      password: '' // Clear password when editing
    });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditForm(null);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  // Update the handleUpdate function
  const handleUpdate = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');

  try {
    console.log('Updating student:', editingStudent.id);
    console.log('Form data:', editForm);

    // Prepare the update data
    const updateData = {
      name: editForm.name.trim(),
      roll_no: editForm.roll_no.trim(),
      year_of_study: parseInt(editForm.year_of_study, 10),
      department: editForm.department.trim(),
      college_name: editForm.college_name.trim(),
      mobile_no: editForm.mobile_no.trim(),
      email: editForm.email.trim()
    };

    // Only include password if it's provided
    if (editForm.password && editForm.password.trim()) {
      updateData.password = editForm.password.trim();
    }

    console.log('Sending update data:', updateData);

    const response = await fetch(`http://localhost:5000/api/student/${editingStudent.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    // Get response text first to handle both JSON and HTML responses
    const responseText = await response.text();
    console.log('Response text:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    setMessage({ type: 'success', text: 'Student updated successfully!' });
    setEditingStudent(null);
    setEditForm(null);
    
    // Refresh the students list
    await fetchStudents();
    
  } catch (error) {
    console.error('Update error:', error);
    setMessage({ 
      type: 'error', 
      text: error.message || 'Failed to update student' 
    });
  } finally {
    setLoading(false);
  }
};

  // Update the handleDelete function
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/student/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
 
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete student');
      }

      setMessage({ type: 'success', text: 'Student deleted successfully!' });
      await fetchStudents();
      await fetchStudentsCount();
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to delete student' });
    }
  };

  const renderStudentsList = () => (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Students List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                {editingStudent?.id === student.id ? (
                  <td colSpan="6" className="px-6 py-4">
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="border p-2 rounded"
                          placeholder="Name"
                          required
                        />
                        <input
                          name="roll_no"
                          value={editForm.roll_no}
                          onChange={handleEditChange}
                          className="border p-2 rounded"
                          placeholder="Roll No"
                          required
                        />
                        <input
                          name="department"
                          value={editForm.department}
                          onChange={handleEditChange}
                          className="border p-2 rounded"
                          placeholder="Department"
                          required
                        />
                        <select
                          name="year_of_study"
                          value={editForm.year_of_study}
                          onChange={handleEditChange}
                          className="border p-2 rounded"
                          required
                        >
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                        <input
                          name="college_name"
                          value={editForm.college_name}
                          onChange={handleEditChange}
                          className="border p-2 rounded"
                          placeholder="College Name"
                          required
                        />
                        <input
                          name="mobile_no"
                          value={editForm.mobile_no}
                          onChange={handleEditChange}
                          className="border p-2 rounded"
                          placeholder="Mobile Number"
                          required
                        />
                        <input
                          name="email"
                          type="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className="border p-2 rounded"
                          placeholder="Email"
                          required
                        />
                        <input
                          name="password"
                          type="password"
                          value={editForm.password}
                          onChange={handleEditChange}
                          className="border p-2 rounded"
                          placeholder="Leave blank to keep unchanged"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                          disabled={loading}
                        >
                          {loading ? 'Updating...' : 'Update'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4">{student.roll_no}</td>
                    <td className="px-6 py-4">{student.department}</td>
                    <td className="px-6 py-4">{student.year_of_study}</td>
                    <td className="px-6 py-4">{student.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                          title="Edit student"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                          title="Delete student"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="mt-4 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin')}
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add Students</h1>
                <p className="text-gray-600">Add students manually or via Excel upload</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Students Count */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Statistics</h3>
          <p className="text-2xl font-bold text-blue-600">Total Students: {studentsCount}</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('manual')}
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === 'manual'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setActiveTab('excel')}
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === 'excel'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Excel Upload
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Manual Entry Tab */}
            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={manualForm.name}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      name="roll_no"
                      value={manualForm.roll_no}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year of Study *
                    </label>
                    <select
                      name="year_of_study"
                      value={manualForm.year_of_study}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={manualForm.department}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      College Name *
                    </label>
                    <input
                      type="text"
                      name="college_name"
                      value={manualForm.college_name}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile_no"
                      value={manualForm.mobile_no}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={manualForm.email}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={manualForm.password}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding Student...' : 'Add Student'}
                </button>
              </form>
            )}

            {/* Excel Upload Tab */}
            {activeTab === 'excel' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Excel File (.xlsx)
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 focus:outline-none"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Required columns: name, roll_no, year_of_study, department, college_name, mobile_no, email, password
                  </p>
                </div>

                {excelData.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">
                      Preview ({excelData.length} students)
                    </h4>
                    <div className="max-h-64 overflow-y-auto border rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {excelData.slice(0, 5).map((student, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">{student.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{student.roll_no}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{student.email}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{student.department}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {excelData.length > 5 && (
                        <div className="text-center py-2 text-sm text-gray-500">
                          ... and {excelData.length - 5} more students
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleBulkUpload}
                      disabled={loading}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Uploading Students...' : `Upload ${excelData.length} Students`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Students List */}
        {renderStudentsList()}
      </div>
    </div>
  );
};

export default AddStudents;