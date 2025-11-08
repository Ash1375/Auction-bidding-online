# 05 Payment Gateway Integration

## Overview
This module implements a **mock payment gateway simulation** for the online auction platform. It demonstrates the complete payment workflow without processing real transactions, making it suitable for project demonstrations and testing.

## Features
- **Mock Payment Processing**: Simulates payment initiation, success, and failure scenarios
- **Random Transaction Outcomes**: 70% success rate for realistic demonstration
- **Transaction Tracking**: Unique transaction IDs for each payment attempt
- **Database Integration**: Stores payment records in MongoDB
- **Frontend Simulation**: Interactive UI that mimics real payment forms
- **Console Logging**: Detailed logs for debugging and demonstration purposes

## API Endpoints
- `POST /api/payment/initiate` - Start a mock payment transaction
- `GET /api/payment/success` - Simulate successful payment completion
- `GET /api/payment/failure` - Simulate failed payment completion

## Important Notes
- **DEMO ONLY**: This implementation is for illustration purposes only
- **NO REAL PAYMENTS**: No actual money is processed or transferred
- **NOT PRODUCTION READY**: Do not use in real-world applications
- **RANDOM OUTCOMES**: Payments succeed or fail randomly for demonstration

## Workflow
1. User initiates payment for won auction
2. System generates transaction ID and decides outcome
3. Mock payment form displays (no real card input)
4. User clicks "Simulate Payment"
5. System processes with delay for realism
6. Payment status updated in database
7. User redirected with success/failure message

## Dependencies Removed
- Stripe SDK (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`)
- All real payment processor integrations

## Environment Variables
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
