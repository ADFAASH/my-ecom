// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import productRoutes from './routes/products.js';
// import orderRoutes from './routes/orders.js';
// import 'dotenv/config'; // Correct way to load .env variables in ES Modules
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.get('/test-server', (req, res) => {
//   res.send('✅ Server is working!');
// });

// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

// // Connect to MongoDB Atlas using the environment variable
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,    // Recommended options for new connections
//   useUnifiedTopology: true  // Recommended options for new connections
// })
//   .then(() => {
//     console.log('MongoDB connected to Atlas!'); // Updated log message
//     app.listen(5050, () => console.log('Server running on port 5050'));
//   })
//   .catch(err => console.error("MongoDB connection error:", err)); // More descriptive error log


// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv'; 
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import Stripe from 'stripe'; 

dotenv.config(); // Load environment variables first

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Body parser for JSON

// --- FIX: Initialize Stripe AFTER dotenv.config() ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Make the stripe instance available to all routes via app.locals or app.set
app.set('stripe', stripe); // Using app.set to make it accessible in req.app.get('stripe')
// --- END FIX ---

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected to Atlas!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});
app.use('/api/products', productRoutes);

// --- FIX: Pass stripe instance or ensure it's accessible to orderRoutes ---
// orderRoutes will now get the stripe instance from req.app.get('stripe')
app.use('/api/orders', orderRoutes);

// --- If you have backend/routes/payment.js, add it here too ---
import paymentRoutes from './routes/payment.js';
app.use('/api/payment', paymentRoutes);
// --- END backend/routes/payment.js inclusion ---


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});