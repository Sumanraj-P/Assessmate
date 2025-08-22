import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'assessmate'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
  seedDatabase();
});

const seedDatabase = async () => {
  try {
    // Create tables first
    await createTables();
    
    // Seed data
    await seedCategories();
    await seedSubjects();
    await seedTopics();
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    const tables = [
      `CREATE TABLE IF NOT EXISTS categories (
        category_id INT AUTO_INCREMENT PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS subjects (
        subject_id INT AUTO_INCREMENT PRIMARY KEY,
        subject_name VARCHAR(100) NOT NULL,
        category_id INT,
        FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE 
      )`,
      
      `CREATE TABLE IF NOT EXISTS topics (
        topic_id INT AUTO_INCREMENT PRIMARY KEY,
        topic_name VARCHAR(100) NOT NULL,
        subject_id INT,
        FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE 
      )`,
      
      `CREATE TABLE IF NOT EXISTS questions (
        question_id INT AUTO_INCREMENT PRIMARY KEY,
        topic_id INT,
        question_type ENUM('MCQ', 'Programming', 'Flowchart') NOT NULL,
        question_text TEXT NOT NULL,
        option_A TEXT,
        option_B TEXT,
        option_C TEXT,
        option_D TEXT,
        correct_answer ENUM('A','B','C','D') NULL,
        flowchart_image VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics(topic_id) ON DELETE CASCADE 
      )`,
      
      `CREATE TABLE IF NOT EXISTS programming_questions (
        prog_id INT AUTO_INCREMENT PRIMARY KEY,
        question_id INT,
        language ENUM('C','C++','Java','Python','Other') NOT NULL,
        starter_code TEXT NULL,
        expected_output TEXT NULL,
        FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE 
      )`
    ];

    let completed = 0;
    tables.forEach((query) => {
      db.query(query, (err) => {
        if (err) {
          reject(err);
        } else {
          completed++;
          if (completed === tables.length) {
            console.log('All tables created successfully');
            resolve();
          }
        }
      });
    });
  });
};

const seedCategories = () => {
  return new Promise((resolve, reject) => {
    const categories = [
      ['Software'],
      ['Hardware']
    ];

    const query = 'INSERT IGNORE INTO categories (category_name) VALUES ?';
    
    db.query(query, [categories], (err, result) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Seeded ${result.affectedRows} categories`);
        resolve();
      }
    });
  });
};

const seedSubjects = () => {
  return new Promise((resolve, reject) => {
    const subjects = [
      // Software subjects (category_id = 1)
      ['C Programming', 1],
      ['C++ Programming', 1],
      ['Java Programming', 1],
      ['Python Programming', 1],
      ['JavaScript', 1],
      ['Data Structures', 1],
      ['Algorithms', 1],
      ['Database Management', 1],
      ['Web Development', 1],
      ['Software Engineering', 1],
      
      // Hardware subjects (category_id = 2)
      ['Digital Electronics', 2],
      ['Computer Architecture', 2],
      ['Microprocessors', 2],
      ['Network Hardware', 2],
      ['Embedded Systems', 2]
    ];

    const query = 'INSERT IGNORE INTO subjects (subject_name, category_id) VALUES ?';
    
    db.query(query, [subjects], (err, result) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Seeded ${result.affectedRows} subjects`);
        resolve();
      }
    });
  });
};

const seedTopics = () => {
  return new Promise((resolve, reject) => {
    const topics = [
      // C Programming topics (subject_id = 1)
      ['Variables and Data Types', 1],
      ['Control Structures', 1],
      ['Loops', 1],
      ['Functions', 1],
      ['Arrays', 1],
      ['Pointers', 1],
      ['Structures', 1],
      ['File Handling', 1],
      ['String Handling', 1],
      ['Memory Management', 1],
      
      // C++ Programming topics (subject_id = 2)
      ['Classes and Objects', 2],
      ['Inheritance', 2],
      ['Polymorphism', 2],
      ['Encapsulation', 2],
      ['Templates', 2],
      ['STL', 2],
      ['Exception Handling', 2],
      ['Operator Overloading', 2],
      ['Virtual Functions', 2],
      ['Constructors and Destructors', 2],
      
      // Java Programming topics (subject_id = 3)
      ['OOP Concepts', 3],
      ['Collections Framework', 3],
      ['Exception Handling', 3],
      ['Multithreading', 3],
      ['File I/O', 3],
      ['Interfaces', 3],
      ['Abstract Classes', 3],
      ['Packages', 3],
      ['Generics', 3],
      ['Lambda Expressions', 3],
      
      // Python Programming topics (subject_id = 4)
      ['Basic Syntax', 4],
      ['Data Structures', 4],
      ['Functions and Modules', 4],
      ['File Operations', 4],
      ['Exception Handling', 4],
      ['OOP in Python', 4],
      ['Libraries and Frameworks', 4],
      ['List Comprehensions', 4],
      ['Decorators', 4],
      ['Generators', 4],
      
      // JavaScript topics (subject_id = 5)
      ['DOM Manipulation', 5],
      ['Event Handling', 5],
      ['Async Programming', 5],
      ['Closures', 5],
      ['Prototypes', 5],
      ['ES6 Features', 5],
      ['Promises', 5],
      ['AJAX', 5],
      ['Regular Expressions', 5],
      ['Error Handling', 5],
      
      // Data Structures topics (subject_id = 6)
      ['Arrays', 6],
      ['Linked Lists', 6],
      ['Stacks', 6],
      ['Queues', 6],
      ['Trees', 6],
      ['Graphs', 6],
      ['Hash Tables', 6],
      ['Heaps', 6],
      ['Binary Search Trees', 6],
      ['AVL Trees', 6],
      
      // Algorithms topics (subject_id = 7)
      ['Sorting Algorithms', 7],
      ['Searching Algorithms', 7],
      ['Graph Algorithms', 7],
      ['Dynamic Programming', 7],
      ['Greedy Algorithms', 7],
      ['Divide and Conquer', 7],
      ['Recursion', 7],
      ['String Algorithms', 7],
      ['Tree Algorithms', 7],
      ['Complexity Analysis', 7],
      
      // Database Management topics (subject_id = 8)
      ['SQL Basics', 8],
      ['Joins', 8],
      ['Normalization', 8],
      ['Indexes', 8],
      ['Transactions', 8],
      ['Stored Procedures', 8],
      ['Triggers', 8],
      ['Views', 8],
      ['Database Design', 8],
      ['Query Optimization', 8],
      
      // Web Development topics (subject_id = 9)
      ['HTML/CSS', 9],
      ['Responsive Design', 9],
      ['Frontend Frameworks', 9],
      ['Backend Development', 9],
      ['REST APIs', 9],
      ['Authentication', 9],
      ['Web Security', 9],
      ['Performance Optimization', 9],
      ['Testing', 9],
      ['Deployment', 9],
      
      // Software Engineering topics (subject_id = 10)
      ['SDLC', 10],
      ['Agile Methodology', 10],
      ['Version Control', 10],
      ['Testing Strategies', 10],
      ['Design Patterns', 10],
      ['Code Review', 10],
      ['Documentation', 10],
      ['Project Management', 10],
      ['Requirements Analysis', 10],
      ['System Design', 10],
      
      // Digital Electronics topics (subject_id = 11)
      ['Logic Gates', 11],
      ['Boolean Algebra', 11],
      ['Combinational Circuits', 11],
      ['Sequential Circuits', 11],
      ['Flip Flops', 11],
      ['Counters', 11],
      ['Multiplexers', 11],
      ['Decoders', 11],
      ['Adders', 11],
      ['Memory Circuits', 11],
      
      // Computer Architecture topics (subject_id = 12)
      ['CPU Design', 12],
      ['Instruction Set', 12],
      ['Pipeline', 12],
      ['Cache Memory', 12],
      ['Memory Hierarchy', 12],
      ['I/O Systems', 12],
      ['Bus Architecture', 12],
      ['Performance Metrics', 12],
      ['Parallel Processing', 12],
      ['RISC vs CISC', 12],
      
      // Microprocessors topics (subject_id = 13)
      ['8085 Architecture', 13],
      ['8086 Architecture', 13],
      ['Assembly Language', 13],
      ['Addressing Modes', 13],
      ['Instruction Set', 13],
      ['Interrupts', 13],
      ['Memory Interface', 13],
      ['I/O Interface', 13],
      ['Timers', 13],
      ['Programming', 13],
      
      // Network Hardware topics (subject_id = 14)
      ['Network Topologies', 14],
      ['Routers', 14],
      ['Switches', 14],
      ['Hubs', 14],
      ['Network Cards', 14],
      ['Cables and Connectors', 14],
      ['Wireless Hardware', 14],
      ['Network Security Devices', 14],
      ['Load Balancers', 14],
      ['Network Troubleshooting', 14],
      
      // Embedded Systems topics (subject_id = 15)
      ['Microcontrollers', 15],
      ['Sensors', 15],
      ['Actuators', 15],
      ['Real-time Systems', 15],
      ['Embedded Programming', 15],
      ['Communication Protocols', 15],
      ['Power Management', 15],
      ['Debugging', 15],
      ['Hardware Design', 15],
      ['IoT Applications', 15]
    ];

    const query = 'INSERT IGNORE INTO topics (topic_name, subject_id) VALUES ?';
    
    db.query(query, [topics], (err, result) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Seeded ${result.affectedRows} topics`);
        resolve();
      }
    });
  });
};