import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// ... your existing imports ...

dotenv.config();

const app = express();

// Improved CORS for mobile and all origins
app.use(cors({
  origin: [
    'https://hotel.stephenweb.space',
    'https://api.hotel.stephenweb.space',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://10.255.255.254:5173',
    'http://172.27.245.41:5173',
    'http://172.18.0.1:5173',
    // Mobile and other origins
    /\.stephenweb\.space$/, // All subdomains
    'https://hotel-pms.pages.dev',
    'http://192.168.*.*:*', // Local network
    'http://10.*.*.*:*'     // Local network
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Device-ID'],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// ... rest of your server code ...
