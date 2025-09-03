import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import toastService from '../utils/toastService';

const AddStudentForm = ({ onClose, onStudentAdded }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  
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

  const handleManualChange = (e) => {
    setManualForm({
      ...manualForm,
      [e.target.name]: e.target.value
    });
  };

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
      
      // Notify parent component
      onStudentAdded();
      
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
        
        // Notify parent component
        onStudentAdded();
      } else {
        toastService.error(data.message || 'Failed to add students');
      }
    } catch (error) {
      toastService.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            title="Back to student list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Add User</h2>
        </div>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="border-b border-gray-100">
            <div className="flex">
              <button
                onClick={() => setActiveTab('manual')}
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === 'manual'
                    ? 'border-b-2 border-blue-500 text-blue-500 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setActiveTab('excel')}
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === 'excel'
                    ? 'border-b-2 border-blue-500 text-blue-500 font-semibold'
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
              <form onSubmit={handleManualSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={manualForm.name}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Enter student's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      name="roll_no"
                      value={manualForm.roll_no}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Enter roll number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year of Study *
                    </label>
                    <select
                      name="year_of_study"
                      value={manualForm.year_of_study}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={manualForm.department}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Enter department"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College Name *
                    </label>
                    <input
                      type="text"
                      name="college_name"
                      value={manualForm.college_name}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Enter college name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile_no"
                      value={manualForm.mobile_no}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Enter mobile number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={manualForm.email}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={manualForm.password}
                      onChange={handleManualChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Enter password"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Adding User...' : 'Add User'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Back to Users List
                  </button>
                </div>
              </form>
            )}

            {/* Excel Upload Tab */}
            {activeTab === 'excel' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Excel File (.xlsx)
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-200 rounded-md hover:border-blue-300 focus:outline-none bg-gray-50"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Required columns: name, roll_no, year_of_study, department, college_name, mobile_no, email, password
                  </p>
                </div>

                {excelData.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">
                      Preview ({excelData.length} Users)
                    </h4>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md shadow-sm">
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
                          ... and {excelData.length - 5} more users
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={handleBulkUpload}
                        disabled={loading}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Uploading Students...' : `Upload ${excelData.length} Students`}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                      >
                        Back to Users List
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentForm;
