import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { PencilIcon, TrashIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import toastService from '../utils/toastService';
import AddStudentForm from '../components/AddStudentForm';


const AddStudents = () => {
  const [loading, setLoading] = useState(false);
  const [studentsCount, setStudentsCount] = useState(0);
  const navigate = useNavigate();

  // View state - 'list' or 'form'
  const [currentView, setCurrentView] = useState('list');

  // Students list and pagination state
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
    
    // If not searching, fetch all students with pagination
    // If searching, fetch search results
    if (isSearching && searchTerm.trim()) {
      handleSearch();
    } else {
      fetchStudents();
    }
  }, [navigate, currentPage, isSearching, searchTerm]);

  // Handle when a student is added through the form
  const handleStudentAdded = () => {
    fetchStudentsCount();
    fetchStudents();
    // Return to list view after adding a student
    setCurrentView('list');
  };

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

    toastService.success('Student added successfully!');

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
    toastService.error(error.message || 'Failed to add student');
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
            toastService.error(`Missing required columns: ${missingColumns.join(', ')}`);
            return;
          }
        }

        setExcelData(jsonData);
        toastService.success(`${jsonData.length} students loaded from Excel file`);
      } catch (error) {
        toastService.error('Error reading Excel file. Please check the format.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleBulkUpload = async () => {
    if (excelData.length === 0) {
      toastService.error('Please upload an Excel file first');
      return;
    }

    setLoading(true);

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
        toastService.success(`Successfully added ${data.count} students!`);
        setExcelData([]);
        setSelectedFile(null);
        fetchStudentsCount(); // Update count
        fetchStudents(); // Update students list
      } else {
        toastService.error(data.message || 'Failed to add students');
      }
    } catch (error) {
      toastService.error('Network error. Please try again.');
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

    toastService.success('Student updated successfully!');
    setEditingStudent(null);
    setEditForm(null);
    
    // Refresh the students list
    await fetchStudents();
    
  } catch (error) {
    console.error('Update error:', error);
    toastService.error(error.message || 'Failed to update student');
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

      toastService.success('Student deleted successfully!');
      await fetchStudents();
      await fetchStudentsCount();
    } catch (error) {
      console.error('Delete error:', error);
      toastService.error(error.message || 'Failed to delete student');
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setIsSearching(false);
    }
  };
  
  // Handle search submission
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!searchTerm.trim()) {
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/search-students?term=${searchTerm}&page=${currentPage}&limit=10`);
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.students);
        setTotalPages(data.pagination.totalPages);
      } else {
        toastService.error(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toastService.error('Error searching students');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle clearing search
  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  const renderStudentsList = () => (
    <div className="mt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Users List</h2>
        
        <div className="flex space-x-2">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="w-full sm:w-auto flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search student by name..."
                className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-200 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-0 top-0 h-full px-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 transition-colors"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </form>
          
          {/* Add Student Button */}
          <button
            onClick={() => setCurrentView('form')}
            className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>
      
      {isSearching && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 p-3 rounded-md border border-blue-100">
          <div className="flex items-center">
            <span className="text-sm text-blue-700 font-medium">
              Search results for: <span className="font-bold">"{searchTerm}"</span>
              {students.length > 0 
                ? ` (${students.length} of ${totalPages * 10} results)`
                : ' (No results found)'}
            </span>
          </div>
          <button
            onClick={handleClearSearch}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}
      
      <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    {editingStudent?.id === student.id ? (
                      <td colSpan="6" className="px-4 sm:px-6 py-4">
                        <form onSubmit={handleUpdate} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                              name="name"
                              value={editForm.name}
                              onChange={handleEditChange}
                              className="border border-gray-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Name"
                              required
                            />
                            <input
                              name="roll_no"
                              value={editForm.roll_no}
                              onChange={handleEditChange}
                              className="border border-gray-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Roll No"
                              required
                            />
                            <input
                              name="department"
                              value={editForm.department}
                              onChange={handleEditChange}
                              className="border border-gray-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Department"
                              required
                            />
                            <select
                              name="year_of_study"
                              value={editForm.year_of_study}
                              onChange={handleEditChange}
                              className="border border-gray-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                              className="border border-gray-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="College Name"
                              required
                            />
                            <input
                              name="mobile_no"
                              value={editForm.mobile_no}
                              onChange={handleEditChange}
                              className="border border-gray-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Mobile Number"
                              required
                            />
                            <input
                              name="email"
                              type="email"
                              value={editForm.email}
                              onChange={handleEditChange}
                              className="border border-gray-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Email"
                              required
                            />
                            <input
                              name="password"
                              type="password"
                              value={editForm.password}
                              onChange={handleEditChange}
                              className="border border-gray-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Leave blank to keep unchanged"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button
                              type="submit"
                              className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm"
                              disabled={loading}
                            >
                              {loading ? 'Updating...' : 'Update'}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{student.name}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{student.roll_no}</td>
                        <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{student.department}</td>
                        <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{student.year_of_study}</td>
                        <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{student.college_name}</td>
                        <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{student.email}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <button
                              onClick={() => handleEdit(student)}
                              className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                              title="Edit student"
                            >
                              <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                              title="Delete student"
                            >
                              <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 sm:px-6 py-8 text-center text-sm text-gray-500">
                    {isSearching ? 'No students found matching your search.' : 'No students found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-center mt-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {currentView === 'list' ? (
        <>
          {/* Students Count */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Statistics</h3>
            <p className="text-2xl font-bold text-blue-500">Total Users: {studentsCount}</p>
          </div>

          {/* Students List */}
          {renderStudentsList()}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <AddStudentForm 
            onClose={() => setCurrentView('list')} 
            onStudentAdded={handleStudentAdded}
          />
        </div>
      )}
    </div>
  );
};

export default AddStudents;