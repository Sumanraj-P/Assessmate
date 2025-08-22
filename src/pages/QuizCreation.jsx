import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api'; 

const QuizCreation = () => {
  const navigate = useNavigate();
  
  // State for dropdowns
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  
  // State for selected values
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questionType, setQuestionType] = useState('MCQ');
  
  // State for form data
  const [formData, setFormData] = useState({
    question_text: '',
    // MCQ fields
    option_A: '',
    option_B: '',
    option_C: '',
    option_D: '',
    correct_answer: '',
    // Flowchart field
    flowchart_image: null, // Change from '' to null
    correct_answer: '', // This will be used for both MCQ and Flowchart
    // Programming fields
    programming_language: 'C',
    starter_code: '',
    expected_output: ''
  });
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // New state for CRUD operations
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch subjects when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchSubjects(selectedCategory);
    }
    setSubjects([]);
    setSelectedSubject('');
    setTopics([]);
    setSelectedTopic('');
  }, [selectedCategory]);

  const fetchSubjects = async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/${categoryId}`);
      const data = await response.json();
      if (data.success) {
        setSubjects(data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Fetch topics when subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedSubject);
    }
    setTopics([]);
    setSelectedTopic('');
  }, [selectedSubject]);

  const fetchTopics = async (subjectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/topics/${subjectId}`);
      const data = await response.json();
      if (data.success) {
        setTopics(data.topics);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle question type change
  const handleQuestionTypeChange = (type) => {
    setQuestionType(type);
    // Reset form data when question type changes
    setFormData({
      question_text: '',
      option_A: '',
      option_B: '',
      option_C: '',
      option_D: '',
      correct_answer: '',
      flowchart_image: null,
      programming_language: 'C',
      starter_code: '',
      expected_output: ''
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTopic) {
      alert('Please select a topic');
      return;
    }

    // Validate flowchart requirements
    if (questionType === 'Flowchart') {
      if (!formData.flowchart_image) {
        alert('Please upload a flowchart image');
        return;
      }
      if (!formData.correct_answer) {
        alert('Please enter the correct output for the flowchart');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        topic_id: selectedTopic,
        question_type: questionType,
        question_text: formData.question_text,
        ...(questionType === 'MCQ' && {
          option_A: formData.option_A,
          option_B: formData.option_B,
          option_C: formData.option_C,
          option_D: formData.option_D,
          correct_answer: formData.correct_answer // This will be A, B, C, or D
        }),
        ...(questionType === 'Flowchart' && {
          flowchart_image: formData.flowchart_image,
          flowchart_answer: formData.correct_answer // This will be the text answer
        })
      };

      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert('Question created successfully!');
        // Reset form
        setFormData({
          question_text: '',
          option_A: '',
          option_B: '',
          option_C: '',
          option_D: '',
          correct_answer: '',
          flowchart_image: null,
          programming_language: 'C',
          starter_code: '',
          expected_output: ''
        });
        setUploadedImage(null); // Reset uploaded image preview
        setShowPreview(false);
      } else {
        alert(data.message || 'Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  // Category CRUD operations
  const handleAddCategory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_name: newItemName }),
      });
      const data = await response.json();
      if (data.success) {
        fetchCategories();
        setShowCategoryModal(false);
        setNewItemName('');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${editItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_name: newItemName }),
      });
      const data = await response.json();
      if (data.success) {
        fetchCategories();
        setShowCategoryModal(false);
        setEditItem(null);
        setNewItemName('');
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          fetchCategories();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  // Subject CRUD operations
  const handleAddSubject = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_name: newItemName,
          category_id: selectedCategory
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchSubjects(selectedCategory);
        setShowSubjectModal(false);
        setNewItemName('');
      }
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleUpdateSubject = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/${editItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject_name: newItemName }),
      });
      const data = await response.json();
      if (data.success) {
        fetchSubjects(selectedCategory);
        setShowSubjectModal(false);
        setEditItem(null);
        setNewItemName('');
      }
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          fetchSubjects(selectedCategory);
        }
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    }
  };

  // Topic CRUD operations
  const handleAddTopic = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_name: newItemName,
          subject_id: selectedSubject
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchTopics(selectedSubject);
        setShowTopicModal(false);
        setNewItemName('');
      }
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  const handleUpdateTopic = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/topics/${editItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic_name: newItemName }),
      });
      const data = await response.json();
      if (data.success) {
        fetchTopics(selectedSubject);
        setShowTopicModal(false);
        setEditItem(null);
        setNewItemName('');
      }
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          fetchTopics(selectedSubject);
        }
      } catch (error) {
        console.error('Error deleting topic:', error);
      }
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('flowchart', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-flowchart`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          flowchart_image: data.filePath
        }));
        setUploadedImage(URL.createObjectURL(file));
      } else {
        alert('Failed to upload image: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    }
  };

  // Render MCQ form
  const renderMCQForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Option A *
        </label>
        <input
          type="text"
          name="option_A"
          value={formData.option_A}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Option B *
        </label>
        <input
          type="text"
          name="option_B"
          value={formData.option_B}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Option C *
        </label>
        <input
          type="text"
          name="option_C"
          value={formData.option_C}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Option D *
        </label>
        <input
          type="text"
          name="option_D"
          value={formData.option_D}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Answer *
        </label>
        <select
          name="correct_answer"
          value={formData.correct_answer}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select correct answer</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>
    </div>
  );

  // Render Flowchart form
  const renderFlowchartForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Flowchart Image *
        </label>
        <div className="mt-1 flex flex-col items-center space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {uploadedImage && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <img
                src={uploadedImage}
                alt="Flowchart preview"
                className="max-w-full h-auto max-h-[300px] rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Add correct answer field for flowchart */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Output/Answer *
        </label>
        <input
          type="text"
          name="correct_answer"
          value={formData.correct_answer}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter the correct output for this flowchart"
          required
        />
      </div>
    </div>
  );

  // Render Programming form
  const renderProgrammingForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Programming Language *
        </label>
        <select
          name="programming_language"
          value={formData.programming_language}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="C">C</option>
          <option value="C++">C++</option>
          <option value="Java">Java</option>
          <option value="Python">Python</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Starter Code (Optional)
        </label>
        <textarea
          name="starter_code"
          value={formData.starter_code}
          onChange={handleInputChange}
          rows="6"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="Enter starter code template (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expected Output
        </label>
        <textarea
          name="expected_output"
          value={formData.expected_output}
          onChange={handleInputChange}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="Enter expected output"
        />
      </div>
    </div>
  );

  // Render Preview
  const renderPreview = () => (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Question Preview</h3>
      
      <div className="bg-white p-4 rounded border">
        <div className="mb-3">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
            {questionType}
          </span>
        </div>
        
        <p className="text-gray-900 mb-4 whitespace-pre-wrap">{formData.question_text}</p>
        
        {questionType === 'MCQ' && (
          <div className="space-y-2">
            <div className={`p-2 rounded ${formData.correct_answer === 'A' ? 'bg-green-100' : 'bg-gray-50'}`}>
              A) {formData.option_A}
            </div>
            <div className={`p-2 rounded ${formData.correct_answer === 'B' ? 'bg-green-100' : 'bg-gray-50'}`}>
              B) {formData.option_B}
            </div>
            <div className={`p-2 rounded ${formData.correct_answer === 'C' ? 'bg-green-100' : 'bg-gray-50'}`}>
              C) {formData.option_C}
            </div>
            <div className={`p-2 rounded ${formData.correct_answer === 'D' ? 'bg-green-100' : 'bg-gray-50'}`}>
              D) {formData.option_D}
            </div>
          </div>
        )}
        
        {questionType === 'Flowchart' && formData.flowchart_image && (
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-2">Flowchart:</p>
              <img
                src={`${API_BASE_URL}${formData.flowchart_image}`}
                alt="Flowchart"
                className="max-w-full h-auto max-h-[400px] rounded-lg shadow-sm"
              />
            </div>
            {formData.correct_answer && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Correct Output:</p>
                <div className="bg-green-100 p-2 rounded">
                  {formData.correct_answer}
                </div>
              </div>
            )}
          </div>
        )}
        
        {questionType === 'Programming' && (
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Language: </span>
              <span className="text-sm text-gray-900">{formData.programming_language}</span>
            </div>
            
            {formData.starter_code && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Starter Code:</p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {formData.starter_code}
                </pre>
              </div>
            )}
            
            {formData.expected_output && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Expected Output:</p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {formData.expected_output}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderModal = (title, isOpen, onClose, onSubmit) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {editItem ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this new component after your imports
  const CustomSelect = ({ options, value, onChange, onEdit, onDelete, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={selectRef}>
        <div
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {value ? options.find(opt => opt.id === value)?.name : placeholder}
        </div>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div 
                key={option.id}
                className="p-2 hover:bg-gray-100 cursor-pointer group"
              >
                <div className="flex justify-between items-center">
                  <div
                    className="flex-grow"
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                    }}
                  >
                    {option.name}
                  </div>
                  <div className="hidden group-hover:flex space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(option);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(option.id);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quiz Creation</h1>
              <p className="mt-1 text-sm text-gray-500">Create questions for assessments</p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Selection Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Question Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditItem(null);
                      setNewItemName('');
                      setShowCategoryModal(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add New
                  </button>
                </div>
                <CustomSelect
                  options={categories.map(cat => ({
                    id: cat.category_id,
                    name: cat.category_name
                  }))}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  onEdit={(category) => {
                    setEditItem(category);
                    setNewItemName(category.name);
                    setShowCategoryModal(true);
                  }}
                  onDelete={handleDeleteCategory}
                  placeholder="Select Category"
                />
              </div>

              {/* Subject Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Subject *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditItem(null);
                      setNewItemName('');
                      setShowSubjectModal(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add New
                  </button>
                </div>
                <CustomSelect
                  options={subjects.map(sub => ({
                    id: sub.subject_id,
                    name: sub.subject_name
                  }))}
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  onEdit={(subject) => {
                    setEditItem(subject);
                    setNewItemName(subject.name);
                    setShowSubjectModal(true);
                  }}
                  onDelete={handleDeleteSubject}
                  placeholder="Select Subject"
                  disabled={!selectedCategory}
                />
              </div>

              {/* Topic Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Topic *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditItem(null);
                      setNewItemName('');
                      setShowTopicModal(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add New
                  </button>
                </div>
                <CustomSelect
                  options={topics.map(topic => ({
                    id: topic.topic_id,
                    name: topic.topic_name
                  }))}
                  value={selectedTopic}
                  onChange={setSelectedTopic}
                  onEdit={(topic) => {
                    setEditItem(topic);
                    setNewItemName(topic.name);
                    setShowTopicModal(true);
                  }}
                  onDelete={handleDeleteTopic}
                  placeholder="Select Topic"
                  disabled={!selectedSubject}
                />
              </div>
            </div>
          </div>

          {/* Question Type Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Question Type</h2>
            
            <div className="flex space-x-6">
              {['MCQ', 'Programming', 'Flowchart'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    value={type}
                    checked={questionType === type}
                    onChange={(e) => handleQuestionTypeChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Question Content</h2>
            
            {/* Question Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <textarea
                name="question_text"
                value={formData.question_text}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your question here..."
                required
              />
            </div>

            {/* Dynamic Form Based on Question Type */}
            {questionType === 'MCQ' && renderMCQForm()}
            {questionType === 'Flowchart' && renderFlowchartForm()}
            {questionType === 'Programming' && renderProgrammingForm()}
          </div>

          {/* Preview Section */}
          {showPreview && formData.question_text && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {renderPreview()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 justify-end">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              disabled={!formData.question_text}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            
            <button
              type="submit"
              disabled={loading || !selectedTopic || !formData.question_text}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Creating...' : 'Create Question'}
            </button>
          </div>
        </form>
      </div>

      {/* Modals */}
      {renderModal(
        editItem ? 'Edit Category' : 'Add New Category',
        showCategoryModal,
        () => {
          setShowCategoryModal(false);
          setEditItem(null);
          setNewItemName('');
        },
        editItem ? handleUpdateCategory : handleAddCategory
      )}

      {renderModal(
        editItem ? 'Edit Subject' : 'Add New Subject',
        showSubjectModal,
        () => {
          setShowSubjectModal(false);
          setEditItem(null);
          setNewItemName('');
        },
        editItem ? handleUpdateSubject : handleAddSubject
      )}

      {renderModal(
        editItem ? 'Edit Topic' : 'Add New Topic',
        showTopicModal,
        () => {
          setShowTopicModal(false);
          setEditItem(null);
          setNewItemName('');
        },
        editItem ? handleUpdateTopic : handleAddTopic
      )}
    </div>
  );
};

export default QuizCreation;