const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrolment = require('../models/Enrolment');
const Exam = require('../models/Exam');

dotenv.config({ path: __dirname + '/../.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillguard_db';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    const existingUsers = await User.countDocuments();
    const existingCourses = await Course.countDocuments();
    if (existingUsers > 0 || existingCourses > 0) {
      throw new Error('Seed stopped: database already contains users or courses. Use a fresh empty database to avoid overwriting data.');
    }
    console.log('Database is empty; creating demo data...');

    console.log('Creating Admin and Student users...');
    // Create Admin User
    const adminUser = await User.create({
      name: 'Dr. Aris Thorne (Admin)',
      email: 'admin@skillguard.com',
      password: 'adminpassword123',
      role: 'Admin'
    });

    // Create Student Users
    const studentUser1 = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan@student.com',
      password: 'studentpassword123',
      role: 'Student'
    });

    const studentUser2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@student.com',
      password: 'studentpassword123',
      role: 'Student'
    });

    console.log('Seeding curated courses with modules and lessons...');

    const coursesData = [
      {
        title: 'Python Foundations for Artificial Intelligence',
        description: 'Learn Python essentials, data structures, functions, NumPy, and data handling as a foundation for AI and machine learning.',
        category: 'Artificial Intelligence & Machine Learning', instructor: 'Dr. Anita Desai', duration: '4 Weeks', difficulty: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60',
        modules: [
          { title: 'Module 1: Python for Data Work', lessons: [
            { title: 'Python Syntax, Variables and Collections', duration: '25 mins', content: 'Understand variables, types, loops, functions, lists, dictionaries, and writing reusable Python code for data tasks.' },
            { title: 'NumPy Arrays and Vectorized Computing', duration: '35 mins', content: 'Explore NumPy arrays, shapes, indexing, broadcasting, and efficient numerical calculations.' }
          ]},
          { title: 'Module 2: Data Preparation', lessons: [
            { title: 'Working with DataFrames in Pandas', duration: '30 mins', content: 'Load datasets, inspect missing values, filter rows, transform columns, and prepare tabular data for modeling.' },
            { title: 'Data Cleaning and Exploratory Analysis', duration: '40 mins', content: 'Clean data, summarize distributions, spot outliers, and identify patterns before training a model.' }
          ]}
        ]
      },
      {
        title: 'Applied Machine Learning Fundamentals',
        description: 'Build a practical understanding of supervised and unsupervised learning, feature engineering, model evaluation, and prediction workflows.',
        category: 'Artificial Intelligence & Machine Learning', instructor: 'Prof. Neel Kulkarni', duration: '6 Weeks', difficulty: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=60',
        modules: [
          { title: 'Module 1: Supervised Learning', lessons: [
            { title: 'Regression and Classification', duration: '40 mins', content: 'Compare regression and classification, define features and labels, and fit baseline models to sample datasets.' },
            { title: 'Decision Trees and Random Forests', duration: '45 mins', content: 'Understand decision boundaries, tree depth, ensemble learning, and how random forests reduce variance.' }
          ]},
          { title: 'Module 2: Evaluation and Improvement', lessons: [
            { title: 'Train-Test Splits and Cross-Validation', duration: '35 mins', content: 'Separate training and testing data, use cross-validation, and avoid data leakage.' },
            { title: 'Metrics, Overfitting and Feature Scaling', duration: '40 mins', content: 'Interpret accuracy, precision, recall, F1 score, and regression metrics while diagnosing overfitting.' }
          ]}
        ]
      },
      {
        title: 'Deep Learning and Neural Networks',
        description: 'Explore neurons, activation functions, loss, backpropagation, optimization, and introductory computer vision and language use cases.',
        category: 'Artificial Intelligence & Machine Learning', instructor: 'Dr. Kavya Shah', duration: '5 Weeks', difficulty: 'Advanced',
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
        modules: [
          { title: 'Module 1: Neural Network Foundations', lessons: [
            { title: 'Perceptrons, Layers and Activations', duration: '35 mins', content: 'Learn how layers, weights, biases, and activation functions combine to model nonlinear patterns.' },
            { title: 'Loss Functions and Backpropagation', duration: '45 mins', content: 'Understand loss functions, gradients, chain rule intuition, and backpropagation during training.' }
          ]},
          { title: 'Module 2: Training Neural Networks', lessons: [
            { title: 'Gradient Descent and Optimizers', duration: '35 mins', content: 'Compare gradient descent, mini-batches, learning rates, and adaptive optimizers.' },
            { title: 'Intro to Vision and Language Models', duration: '40 mins', content: 'Review CNN concepts for image data and transformer concepts for language tasks.' }
          ]}
        ]
      },
      {
        title: 'Generative AI and Large Language Models',
        description: 'Learn the concepts behind large language models, prompt design, embeddings, retrieval-augmented generation, and responsible AI use.',
        category: 'Artificial Intelligence & Machine Learning', instructor: 'Eng. Vikram Patil', duration: '4 Weeks', difficulty: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&auto=format&fit=crop&q=60',
        modules: [
          { title: 'Module 1: LLM Essentials', lessons: [
            { title: 'Tokens, Embeddings and Transformers', duration: '35 mins', content: 'Understand tokenization, vector embeddings, attention, and the transformer architecture at a conceptual level.' },
            { title: 'Prompt Engineering Basics', duration: '30 mins', content: 'Design clear instructions, provide examples, constrain output formats, and evaluate prompt quality.' }
          ]},
          { title: 'Module 2: Building AI Applications', lessons: [
            { title: 'Retrieval-Augmented Generation', duration: '40 mins', content: 'Learn how document chunking, embeddings, vector search, and retrieval can ground generated answers.' },
            { title: 'Responsible AI and Evaluation', duration: '35 mins', content: 'Review hallucination risks, privacy, bias, evaluation sets, and human review.' }
          ]}
        ]
      }
    ];
    const createdCourses = await Course.create(coursesData);
    console.log(`Created ${createdCourses.length} courses.`);

    await Exam.create({
      course: createdCourses[0]._id,
      title: 'AI Foundations Checkpoint',
      instructions: 'Answer each question carefully. Copy/paste and tab switching are monitored.',
      durationMinutes: 10,
      passMark: 60,
      maxAttempts: 3,
      createdBy: adminUser._id,
      questions: [
        { prompt: 'Which Python library is commonly used for numerical arrays?', options: ['NumPy', 'Express', 'Mongoose', 'React Router'], correctOption: 0, points: 1 },
        { prompt: 'In supervised learning, a training dataset typically contains:', options: ['Only unlabeled inputs', 'Inputs and target labels', 'Only model weights', 'Only source code'], correctOption: 1, points: 1 },
        { prompt: 'What is the main purpose of a train-test split?', options: ['Increase dataset size', 'Evaluate generalization on held-out data', 'Remove all features', 'Encrypt the dataset'], correctOption: 1, points: 1 },
        { prompt: 'Which metric is often useful when classes are imbalanced?', options: ['Font size', 'Precision and recall', 'File extension', 'Screen resolution'], correctOption: 1, points: 1 },
        { prompt: 'What does overfitting mean?', options: ['Model performs well on training data but poorly on unseen data', 'Model has no parameters', 'Dataset is always too small to load', 'Model never trains'], correctOption: 0, points: 1 }
      ]
    });
    console.log('Created sample AI Foundations checkpoint exam.');

    // Enrol Student 1 in MERN Course and complete 2 lessons
    const mernCourse = createdCourses[0];
    const lesson1Id = mernCourse.modules[0].lessons[0]._id;
    const lesson2Id = mernCourse.modules[0].lessons[1]._id;
    const totalMernLessons = mernCourse.modules.reduce((sum, m) => sum + m.lessons.length, 0);

    const enrolment1 = await Enrolment.create({
      student: studentUser1._id,
      course: mernCourse._id,
      completedLessons: [lesson1Id, lesson2Id],
      progress: Math.round((2 / totalMernLessons) * 100),
      enrolledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    // Enrol Student 2 in MERN Course and Python Course
    const pythonCourse = createdCourses[1];
    const totalPythonLessons = pythonCourse.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const pythonLesson1 = pythonCourse.modules[0].lessons[0]._id;

    await Enrolment.create({
      student: studentUser2._id,
      course: mernCourse._id,
      completedLessons: [lesson1Id],
      progress: Math.round((1 / totalMernLessons) * 100),
      enrolledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    await Enrolment.create({
      student: studentUser2._id,
      course: pythonCourse._id,
      completedLessons: [pythonLesson1],
      progress: Math.round((1 / totalPythonLessons) * 100),
      enrolledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    console.log('Seeded sample enrolments successfully.');
    console.log('\n--- DEFAULT DEMO CREDENTIALS ---');
    console.log('Admin Account:');
    console.log('  Email:    admin@skillguard.com');
    console.log('  Password: adminpassword123\n');
    console.log('Student Accounts:');
    console.log('  Email:    rohan@student.com');
    console.log('  Password: studentpassword123');
    console.log('  Email:    priya@student.com');
    console.log('  Password: studentpassword123');
    console.log('--------------------------------\n');

    await mongoose.connection.close();
    console.log('Database connection closed. Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
