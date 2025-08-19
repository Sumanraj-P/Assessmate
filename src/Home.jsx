import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Award, 
  BarChart3, 
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  GraduationCap,
  Shield,
  Clock,
  Target
} from 'lucide-react';

export default function AssessMatePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 w-full">
      {/* Header */}
      <header className="bg-white shadow-lg relative z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AssessMate
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                How it Works
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                About
              </a>
            </nav>

            {/* Login Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <a 
                href="/login"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all transform hover:scale-105 shadow-lg"
              >
                Login
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">
                  Features
                </a>
                <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium">
                  How it Works
                </a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium">
                  About
                </a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <a 
                    href="/login"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium"
                  >
                    Login
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full text-center">
          <div className="mb-8">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Assessment
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your educational assessments with our intuitive platform. Create, manage, and deliver assessments seamlessly while gaining valuable insights into student performance.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a 
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all transform hover:scale-105 shadow-xl flex items-center justify-center group"
            >
              Get Start Here
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Assessments Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">50,000+</div>
              <div className="text-gray-600">Students Assessed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Reliability</div>
            </div>
          </div>
        </div>
      </section>
 
      {/* Features Section */}
      <section id="features" className="py-20 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Assessment
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create, manage, and analyze assessments in one comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Admin Control</h4>
              <p className="text-gray-600 leading-relaxed">
                Complete administrative control with student management, assessment creation, and comprehensive analytics dashboard.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Student Management</h4>
              <p className="text-gray-600 leading-relaxed">
                Easily add, organize, and manage student accounts with role-based access and progress tracking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Assessment Creation</h4>
              <p className="text-gray-600 leading-relaxed">
                Create diverse assessments with multiple question types, time limits, and customizable settings.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Real-time Testing</h4>
              <p className="text-gray-600 leading-relaxed">
                Students can take assessments with real-time saving, timer controls, and immediate feedback options.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-teal-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-teal-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Reports</h4>
              <p className="text-gray-600 leading-relaxed">
                Detailed performance analytics with visual charts, progress tracking, and comprehensive reports.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-pink-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-pink-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Performance Tracking</h4>
              <p className="text-gray-600 leading-relaxed">
                Track individual and group performance with detailed insights and improvement recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">How AssessMate Works</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our streamlined three-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Admin Setup</h4>
              <p className="text-gray-600 leading-relaxed">
                Create your admin account, add students to the platform, and set up your first assessment with our intuitive interface.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Create Assessments</h4>
              <p className="text-gray-600 leading-relaxed">
                Design comprehensive assessments with various question types, set time limits, and configure grading criteria.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-violet-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Students Take Tests</h4>
              <p className="text-gray-600 leading-relaxed">
                Students log in, take their assessments, and receive instant results while you track their progress in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 w-full">
        <div className="w-full text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Assessment Process?
          </h3>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of educators who trust AssessMate for their assessment needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 font-semibold transition-all transform hover:scale-105 shadow-xl">
              Start Free Trial
            </button>
            <button className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl hover:bg-white hover:text-blue-600 font-semibold transition-all transform hover:scale-105">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-bold">AssessMate</h4>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering education through intelligent assessment solutions.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="text-lg font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h5 className="text-lg font-semibold mb-4">Platform</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Admin Dashboard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Student Portal</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">System Status</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="text-lg font-semibold mb-4">Contact</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">help@assessmate.com</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">1-800-ASSESS</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-12 text-center">
            <p className="text-gray-400">
              © 2025 AssessMate. All rights reserved. Built with ❤️ for educators worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
