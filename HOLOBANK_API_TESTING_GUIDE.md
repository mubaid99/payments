# Holobank API Testing Guide

## 📋 Overview

This guide provides comprehensive testing instructions for the Holobank API integration with proper Postman collection examples.

## 🚀 Quick Start

### 1. Import Collection & Environment

1. **Import Collection**: Import `Holobank_API_Collection.postman_collection.json`
2. **Import Environment**: Import `Holobank_Environment.postman_environment.json`
3. **Set Environment**: Select "Holobank Development Environment" in Postman

### 2. Setup Prerequisites

Before testing, ensure:
- ✅ Server is running on `http://localhost:3000`
- ✅ MongoDB database is connected
- ✅ User exists in database (update `user_id` in environment)
- ✅ `.env` file has correct Holobank credentials

## 🔄 Testing Flow

### **Step 1: KYC Upload** 
```
POST /api/v1/holobank/kyc
```
- Upload KYC documents for user verification
- **Required**: User must exist in database
- **File**: Attach PDF/JPG/PNG document
- **Sets**: `kyc_id` for future requests

### **Step 2: Create Account**
```
POST /api/v1/holobank/account
```
- Create bank account after KYC approval
- **Required**: KYC status = 'approved'
- **Sets**: `account_id` for future requests
- **Options**: checking, savings, business accounts

### **Step 3: Create Card**
```
POST /api/v1/holobank/card  
```
- Create debit/credit/prepaid card
- **Required**: Valid account from Step 2
- **Sets**: `card_id` for future requests
- **Limit**: Positive number for spending limit

### **Step 4: Transfer Funds**
```
POST /api/v1/holobank/transfer
```
- Transfer between accounts
- **Required**: Sufficient balance
- **Features**: Real-time WebSocket notifications
- **Sets**: `transaction_id` for tracking

### **Step 5: Check Balance**
```
GET /api/v1/holobank/balance/:accountId
```
- Get current account balance
- **Features**: Real-time updates, WebSocket notifications
- **Security**: Account ownership verification

## 🧪 Test Scenarios

### ✅ Success Cases

1. **Complete User Journey**: KYC → Account → Card → Transfer → Balance
2. **Multiple Accounts**: Create different account types (checking, savings)
3. **Multiple Cards**: Create different card types with various limits
4. **Currency Support**: Test USD, EUR, GBP transactions
5. **Balance Tracking**: Verify balance updates after transfers

### ❌ Error Cases

1. **Invalid User ID**: Test with non-existent user
2. **KYC Not Approved**: Try account creation before KYC approval
3. **Insufficient Balance**: Transfer more than available balance  
4. **Missing Fields**: Send incomplete request data
5. **Invalid Account**: Use non-existent account IDs
6. **Unauthorized Access**: Try accessing other users' accounts

## 📊 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | Development server URL | `http://localhost:3000` |
| `api_version` | API version prefix | `/api/v1` |
| `user_id` | MongoDB user ObjectId | `507f1f77bcf86cd799439011` |
| `account_id` | Auto-populated after account creation | `acc_123456789` |
| `card_id` | Auto-populated after card creation | `card_987654321` |

## 🔧 Pre-Request Scripts

The collection includes automatic:
- ✅ Timestamp generation
- ✅ Environment variable updates
- ✅ Dynamic ID population

## 🧩 Post-Request Tests

Each request includes automated tests for:
- ✅ Status code validation
- ✅ Response structure verification  
- ✅ Data type validation
- ✅ Business logic verification
- ✅ Environment variable updates

## 📡 WebSocket Testing

### Real-time Events

The API emits WebSocket events for:

1. **Transaction Updates**: `holobank:transactions`
```javascript
{
  "type": "debit",
  "accountId": "acc_123456789",
  "amount": 250.50,
  "currency": "USD",
  "transactionId": "txn_987654321",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

2. **Balance Updates**: `holobank:balanceUpdate`
```javascript
{
  "accountId": "acc_123456789", 
  "newBalance": 1749.50,
  "currency": "USD"
}
```

### WebSocket Connection

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000');

// Join user room for notifications
socket.emit('holobank:join', { userId: 'your_user_id' });

// Listen for events
socket.on('holobank:transactions', (data) => {
  console.log('Transaction:', data);
});

socket.on('holobank:balanceUpdate', (data) => {
  console.log('Balance Update:', data);
});
```

## 🔍 Troubleshooting

### Common Issues

1. **404 Errors**
   - ✅ Check server is running on port 3000
   - ✅ Verify API routes are registered correctly

2. **User Not Found**
   - ✅ Update `user_id` in environment with valid MongoDB ObjectId
   - ✅ Ensure user exists in database

3. **KYC Errors**  
   - ✅ Upload valid document file
   - ✅ Check user has proper bankDetails structure

4. **Account Creation Fails**
   - ✅ Ensure KYC status is 'approved' 
   - ✅ Use valid account types: checking/savings/business
   - ✅ Use valid currencies: USD/EUR/GBP

5. **Transfer Errors**
   - ✅ Verify sufficient balance
   - ✅ Check account ownership
   - ✅ Use valid destination account ID

### Debug Steps

1. **Check Server Logs**: Monitor console for error details
2. **Database Verification**: Ensure MongoDB connection and user data
3. **Environment Variables**: Verify `.env` file has correct Holobank credentials
4. **Postman Console**: Check request/response details in Postman console

## 📈 Performance Testing

### Response Time Expectations

| Endpoint | Expected Response Time |
|----------|----------------------|
| KYC Upload | < 3000ms (file dependent) |
| Account Creation | < 1000ms |
| Card Creation | < 1000ms |
| Transfer | < 2000ms |
| Balance Check | < 500ms |

### Load Testing

Run the collection with multiple iterations to test:
- ✅ Concurrent requests handling
- ✅ Database connection pooling
- ✅ Memory usage optimization
- ✅ WebSocket connection limits

## 🔐 Security Testing

### Authentication Tests

1. **Missing User ID**: Verify proper error handling
2. **Invalid User ID**: Test with malformed ObjectIds  
3. **Account Ownership**: Ensure users can't access other accounts
4. **Input Validation**: Test with SQL injection attempts
5. **File Upload Security**: Test with malicious file types

### Data Validation

1. **Required Fields**: Test missing mandatory fields
2. **Data Types**: Test with incorrect data types
3. **Range Validation**: Test with negative amounts/limits
4. **Currency Codes**: Test with invalid currency codes
5. **Account Types**: Test with invalid account types

## 📝 Test Reports

The collection generates automatic test reports showing:
- ✅ Pass/Fail status for each test
- ✅ Response times and performance metrics
- ✅ Error details and debugging information
- ✅ Coverage of success and error scenarios

Run the collection with Postman's Collection Runner for comprehensive test reporting and automated validation of all Holobank API endpoints.