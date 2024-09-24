const express = require('express');
const authRoutes = require('./src/routes/auth');
const recipeRoutes = require('./src/routes/recipe');
const path = require('path');

const app = express();

app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  } else {
    next();
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));