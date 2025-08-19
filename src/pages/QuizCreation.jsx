import React, { useState } from 'react';
import { Check, Plus, Save, X, Upload, Code, FileText } from 'lucide-react';

const QuizCreationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    code: '',
    language: 'c',
    expectedAnswer: '',
    image: null
  });

  const subtopics = [
    { id: 'datatypes', name: 'Datatypes', icon: '📊' },
    { id: 'loops', name: 'Loops', icon: '🔄' },
    { id: 'pointers', name: 'Pointers', icon: '👉' },
    { id: 'unions', name: 'Unions', icon: '🔗' },
    { id: 'functions', name: 'Functions', icon: '⚙️' },
    { id: 'arrays', name: 'Arrays', icon: '📋' },
    { id: 'strings', name: 'Strings', icon: '📝' },
    { id: 'structures', name: 'Structures', icon: '🏗️' },
    { id: 'programming', name: 'Programming', icon: '💻', special: true }
  ];

  const programmingLanguages = [
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' }
  ];

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubtopicToggle = (subtopicId) => {
    if (selectedSubtopics.includes(subtopicId)) {
      setSelectedSubtopics(selectedSubtopics.filter(id => id !== subtopicId));
    } else {
      setSelectedSubtopics([...selectedSubtopics, subtopicId]);
    }
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addQuestion = () => {
    if (currentQuestion.question.trim()) {
      setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
      setCurrentQuestion({
        type: 'mcq',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        code: '',
        language: 'c',
        expectedAnswer: '',
        image: null
      });
    }
  };

  const removeQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
            currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
          }`}>
            {currentStep > step ? <Check className="w-5 h-5" /> : step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          )}
        </div>
      ))}
    </div>
  );

  const Step1CategorySelection = () => (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Category</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category Type</label>
          <select 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="software">Software</option>
            <option value="hardware">Hardware</option>
          </select>
        </div>

        {selectedCategory === 'software' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Programming Language</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="">Select Language</option>
              <option value="c">C Language</option>
              <option value="cpp">C++</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNextStep}
          disabled={!selectedCategory || !selectedLanguage}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );

  const Step2SubtopicSelection = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Subtopics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {subtopics.map((subtopic) => (
          <div
            key={subtopic.id}
            onClick={() => handleSubtopicToggle(subtopic.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedSubtopics.includes(subtopic.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            } ${subtopic.special ? 'ring-2 ring-purple-200' : ''}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{subtopic.icon}</div>
              <h3 className="font-semibold text-gray-800">{subtopic.name}</h3>
              {subtopic.special && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mt-2 inline-block">
                  Code Editor
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePreviousStep}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleNextStep}
          disabled={selectedSubtopics.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );

  const Step3QuestionCreation = () => {
    const isProgrammingSelected = selectedSubtopics.includes('programming');
    const hasRegularTopics = selectedSubtopics.some(topic => topic !== 'programming');

    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Questions</h2>
        
        {/* Question Type Selector */}
        <div className="mb-6 flex justify-center">
          <div className="bg-gray-100 p-1 rounded-lg">
            {hasRegularTopics && (
              <button
                onClick={() => handleQuestionChange('type', 'mcq')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentQuestion.type === 'mcq' 
                    ? 'bg-white text-blue-600 shadow' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                MCQ Question
              </button>
            )}
            {isProgrammingSelected && (
              <button
                onClick={() => handleQuestionChange('type', 'programming')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentQuestion.type === 'programming' 
                    ? 'bg-white text-purple-600 shadow' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Code className="w-4 h-4 inline mr-2" />
                Programming Question
              </button>
            )}
          </div>
        </div>

        {/* Question Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          {currentQuestion.type === 'mcq' ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter your question here..."
                  value={currentQuestion.question}
                  onChange={(e) => handleQuestionChange('question', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {['A', 'B', 'C', 'D'].map((option, index) => (
                  <div key={option} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={option}
                      checked={currentQuestion.correctAnswer === option}
                      onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">Option {option}</label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Enter option ${option}...`}
                        value={currentQuestion.options[index]}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Upload Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter your programming question here..."
                  value={currentQuestion.question}
                  onChange={(e) => handleQuestionChange('question', e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Programming Language</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={currentQuestion.language}
                  onChange={(e) => handleQuestionChange('language', e.target.value)}
                >
                  {programmingLanguages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Code Editor</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  rows="10"
                  placeholder="Write your code here..."
                  value={currentQuestion.code}
                  onChange={(e) => handleQuestionChange('code', e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Answer/Solution (Optional)</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="4"
                  placeholder="Enter expected answer or solution explanation..."
                  value={currentQuestion.expectedAnswer}
                  onChange={(e) => handleQuestionChange('expectedAnswer', e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </button>
          </div>
        </div>

        {/* Added Questions List */}
        {questions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Added Questions ({questions.length})</h3>
            <div className="space-y-3">
              {questions.map((q, index) => (
                <div key={q.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                        Q{index + 1}
                      </span>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                        {q.type === 'mcq' ? 'MCQ' : 'Programming'}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm line-clamp-2">{q.question}</p>
                  </div>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePreviousStep}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          
          <div className="flex space-x-3">
            <button className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors">
              Cancel
            </button>
            <button
              disabled={questions.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Quiz
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AssessMate</h1>
          <p className="text-gray-600">Professional Quiz Creation Platform</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm min-h-96 p-8">
          {currentStep === 1 && <Step1CategorySelection />}
          {currentStep === 2 && <Step2SubtopicSelection />}
          {currentStep === 3 && <Step3QuestionCreation />}
        </div>
      </div>
    </div>
  );
};

export default QuizCreationPage;