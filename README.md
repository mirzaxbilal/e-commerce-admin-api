# Ecommerce Admin API

This repository contains the Ecommerce application, which uses Docker for easy setup and deployment.

## Features

- Add, retrieve, and manage products and categories  
- Retrieve detailed sales data with filtering, grouping, and pagination  
- View total revenue and compare revenue between different periods  
- Get sales summaries grouped by category or product  
- Manage inventory: view all stock, low-stock alerts, and update stock quantities  
- Pagination and filtering support across endpoints for efficient data handling  
- Built with Docker for easy local setup.

## Tech Stack

- **Programming Language & Framework**: Node.js with Express.js  
- **API Type**: RESTful API  
- **Database**: PostgreSQL

## Setup Instructions

Follow these steps to run the application locally:

### 1. Prepare environment variables

Rename the `.env.test` file to `.env` in the root directory.

### 2.  Build and run the application.
Open terminal in root directory and run following command:

```docker-compose up --build```

### 2. Seed the database
In a separate terminal, run the following command to seed the database:

```docker exec -it ecommerce-app sh -c "node seed/seed.js"```

You are now ready to use the Ecommerce API on http://localhost:5000/

Note: Seed data is between 2025-01-10 to 2025-05-10, so make sure to use dates between this period in api calls. To have better query results please check the data in seed/seed.js

---

## API Endpoints

### Product Endpoints

All product-related routes are prefixed with `/api/product`.

#### `POST /api/product`
- **Description**: Adds a new product to the system.
- **Request Body**:
  ```json
  {
    "name": "Product Name",
    "categoryId": 1,
    "price": 100,
    "stock": 50
  }
  ```

## API Endpoints

### Product Endpoints

All product-related routes are prefixed with `/api/product`.

#### `POST /api/product/`
- **Description**: Adds a new product to the system.
- **Request Body**:
  ```json
  {
    "name": "Product Name",
    "categoryId": 1,
    "price": 100,
    "stock": 50
  }

#### `GET /api/product/`
- **Description**: Retrieves a list of all products.
- **Query Parameters** (optional):
  - `limit`: Number of results to return
  - `offset`: Number of items to skip

### Category Endpoints

All category-related routes are prefixed with /api/category.

#### `POST /api/category/`
- **Description**: Adds a new category to the system.
- **Request Body**:
  ```json
  {
  "name": "Electronics"
  }
  
#### `GET /api/category`
- **Description**: Retrieves a list of all categories.
- **Query Parameters** (optional):
  - `limit`: Number of results to return
  - `offset`: Number of items to skip

### Sales Endpoints

All sales-related routes are prefixed with /api/sales.

#### `GET /api/sales/`
- **Description**:Retrieves sales data with optional filtering, grouping, and pagination.
- **Query Parameters**
 - `startDate`: Filter sales from this date (optional)  
 - `endDate`: Filter sales up to this date (optional)  
 - `categoryId`: Filter by category (optional)  
 - `productId`: Filter by product (optional)  
 - `groupBy`: Group results by one of: `daily`, `weekly`, `monthly`, `annual` (optional)  
 - `limit`: Number of results to return (default: 10)  
 - `offset`: Number of records to skip (default: 0)  

#### `GET /api/sales/revenue/`
-**Description:**:Returns total revenue over time, grouped by period.
-**Query Parameters:**
 - `period`: `daily`, `weekly`, `monthly`, or `annual` (default: `daily`)  
 - `startDate`: Filter revenue from this date (optional)  
 - `endDate`: Filter revenue up to this date (optional)  
 - `categoryId`: Filter by category (optional)  
 - `productId`: Filter by product (optional)  
 - `limit`: Number of results to return (default: 10)  
 - `offset`: Number of records to skip (default: 0)  

#### `GET /api/sales/comparison`

- **Description:** Returns total revenue comparison between two periods.  
- **Query Parameters:**  
  - `period1Start`: Start date for the first period (required)  
  - `period1End`: End date for the first period (required)  
  - `period2Start`: Start date for the second period (required)  
  - `period2End`: End date for the second period (required)  
  - `categoryId`: Filter by category (optional)  
  - `productId`: Filter by product (optional)  

#### `GET /api/sales/summary`

- **Description:** Returns sales summary grouped by category or product.  
- **Query Parameters:**  
  - `groupBy`: Group by `category` or `product` (default: `category`)  
  - `startDate`: Filter sales from this date (optional)  
  - `endDate`: Filter sales up to this date (optional)  
  - `limit`: Number of results to return (default: 10)  
  - `offset`: Number of records to skip (default: 0)
 
 ### Inventory Endpoints

All inventory-related routes are prefixed with /api/inventory/

 #### `GET /api/inventory/`

- **Description:** Retrieve a paginated list of all inventory items with their product names and quantities.  
- **Query Parameters:**  
  - `limit`: Number of results to return (default: 10)  
  - `offset`: Number of records to skip (default: 0)  

#### `GET /api/inventory/low-stock`

- **Description:** Retrieve a paginated list of inventory items where the stock quantity is below a specified threshold.  
- **Query Parameters:**  
  - `threshold`: Stock quantity threshold to filter low stock items (default: 5)  
  - `limit`: Number of results to return (default: 10)  
  - `offset`: Number of records to skip (default: 0)  

#### `GET /api/inventory/:productId`

- **Description:** Retrieve inventory details for a specific product by its ID.  
- **URL Parameters:**  
  - `productId`: ID of the product (required)  

#### `PUT /api/inventory/:productId`

- **Description:** Update the stock quantity of a specific product in inventory.  
- **URL Parameters:**  
  - `productId`: ID of the product (required)  
- **Request Body:**  
  - `quantity_in_stock`: New quantity to set (required)  

---




