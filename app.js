const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose'); // You'll need to install and configure mongoose
const bcrypt = require('bcrypt'); // Import the bcrypt library for password hashing
const session = require('express-session'); // Import the express-session library for user sessions

// ...

// Middleware for handling form data and sessions
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: 'your_secret_key', resave: true, saveUninitialized: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost/myexpressapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define the User model (as mentioned earlier in user.js)
const User = require('./models/user');
app.get('/', (req, res) => {
    res.send('Welcome to My Express Application'); // Customize this message or render a view.
  });
// Registration route
app.get('/register', (req, res) => {
  res.render('register'); // Render the registration form
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Validation and user existence checks
  // Hash the password (using bcrypt)

  // Create a new user document in MongoDB
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    // User with the same username already exists
    res.render('register', { error: 'Username already taken' });
  } else {
    // Create a new user in MongoDB
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    // Redirect the user to the login page or some other page
    res.redirect('/login');
  }
});

// Login route
app.get('/login', (req, res) => {
  res.render('login'); // Render the login form
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user in MongoDB
  const user = await User.findOne({ username });

  if (!user) {
    // User not found
    res.render('login', { error: 'User not found' });
  } else {
    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Successful login
      req.session.user = user; // Create a session
      res.redirect('/dashboard'); // Redirect to a protected page
    } else {
      // Authentication failed
      res.render('login', { error: 'Incorrect password' });
    }
  }
});

// ...

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

