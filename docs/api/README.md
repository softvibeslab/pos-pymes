# POS PyMES API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, the API uses PIN-based authentication. Include the PIN in the request body for login operations.

## Endpoints

### Sales

#### Create Sale
```http
POST /api/sales
Content-Type: application/json

{
  "storeId": "string",
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": number,
      "unitPrice": number,
      "costPrice": number
    }
  ],
  "paymentMethod": "cash" | "card" | "credit",
  "cardLast4": "string",
  "discount": number
}
```

#### Get Sale
```http
GET /api/sales/:id
```

#### List Sales
```http
GET /api/sales?page=1&pageSize=20&startDate=&endDate=&status=&userId=&paymentMethod=
```

#### Cancel Sale
```http
DELETE /api/sales/:id
```

#### Complete Sale
```http
POST /api/sales/:id/complete
Content-Type: application/json

{
  "customerId": "string",
  "discount": number,
  "notes": "string"
}
```

### Products

#### List Products
```http
GET /api/products?page=1&pageSize=20&search=&category=&unitType=&lowStock=false
```

#### Get Product
```http
GET /api/products/:id
```

#### Get Product by Barcode
```http
GET /api/products/barcode/:code
```

#### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "barcode": "string",
  "name": "string",
  "brand": "string",
  "categoryId": "string",
  "unitType": "piece" | "weight" | "bulk",
  "costPrice": number,
  "salePrice": number,
  "stockCurrent": number,
  "stockMin": number,
  "imageUrl": "string"
}
```

#### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "string",
  "brand": "string",
  "categoryId": "string",
  "unitType": "piece" | "weight" | "bulk",
  "costPrice": number,
  "salePrice": number,
  "stockCurrent": number,
  "stockMin": number,
  "imageUrl": "string"
}
```

#### Delete Product
```http
DELETE /api/products/:id
```

### Customers

#### List Customers
```http
GET /api/customers?page=1&pageSize=20&search=&hasCredit=false
```

#### Get Customer
```http
GET /api/customers/:id
```

#### Create Customer
```http
POST /api/customers
Content-Type: application/json

{
  "name": "string",
  "phone": "string",
  "email": "string",
  "address": "string",
  "creditLimit": number,
  "whatsappEnabled": boolean,
  "notes": "string"
}
```

#### Update Customer
```http
PUT /api/customers/:id
Content-Type: application/json

{
  "name": "string",
  "phone": "string",
  "email": "string",
  "address": "string",
  "creditLimit": number,
  "whatsappEnabled": boolean,
  "notes": "string"
}
```

#### Delete Customer
```http
DELETE /api/customers/:id
```

### Credits

#### List Credits
```http
GET /api/credits?page=1&pageSize=20&status=&customerId=
```

#### Get Credit
```http
GET /api/credits/:id
```

#### Record Payment
```http
POST /api/credits/:id/pay
Content-Type: application/json

{
  "amount": number,
  "paymentDate": "string",
  "notes": "string"
}
```

### Cash Management

#### Open Cash Drawer
```http
POST /api/cash/open
Content-Type: application/json

{
  "amount": number,
  "userId": "string",
  "storeId": "string"
}
```

#### Create Cash Movement
```http
POST /api/cash/movements
Content-Type: application/json

{
  "type": "deposit" | "withdrawal",
  "amount": number,
  "notes": "string"
}
```

#### Close Cash Drawer (Blind Closing)
```http
POST /api/cash/close
Content-Type: application/json

{
  "openingAmount": number,
  "countedCash": number,
  "cardTotal": number
}
```

#### Verify Closing
```http
POST /api/cash/verify/:id
Content-Type: application/json

{
  "countedCash": number,
  "cardTotal": number
}
```

#### Get Cash Report
```http
GET /api/cash/report/:date
```

### Dashboard

#### Get Daily Summary
```http
GET /api/dashboard/summary?date=YYYY-MM-DD
```

Response:
```json
{
  "success": true,
  "data": {
    "date": "string",
    "totalSales": number,
    "totalProfit": number,
    "totalTransactions": number,
    "averageTicket": number,
    "cashTotal": number,
    "cardTotal": number,
    "creditTotal": number,
    "pendingCredits": number,
    "lowStockProducts": number
  }
}
```

#### Get Sales Chart Data
```http
GET /api/dashboard/sales?period=7d&startDate=&endDate=
```

#### Get Profits Data
```http
GET /api/dashboard/profits?period=30d&startDate=&endDate=
```

#### Get Inventory Alerts
```http
GET /api/dashboard/inventory
```

#### Get Credits Overview
```http
GET /api/dashboard/credits
```

### Users

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "pin": "string"
}
```

#### List Users
```http
GET /api/users?page=1&pageSize=20&active=true
```

#### Get User
```http
GET /api/users/:id
```

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "pin": "string",
  "role": "owner" | "manager" | "cashier",
  "permissions": ["string"]
}
```

#### Update User
```http
PUT /api/users/:id
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "pin": "string",
  "role": "owner" | "manager" | "cashier",
  "permissions": ["string"],
  "active": boolean
}
```

#### Deactivate User
```http
DELETE /api/users/:id
```

## Error Responses

All endpoints follow this error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Authentication required or failed
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `DUPLICATE_ENTRY` - Resource already exists
- `INSUFFICIENT_STOCK` - Not enough stock for operation
- `INSUFFICIENT_CREDIT` - Customer has insufficient credit
- `CASH_ALREADY_OPEN` - Cash drawer already open
- `CASH_NOT_OPEN` - Cash drawer not open
- `INTERNAL_ERROR` - Server error
