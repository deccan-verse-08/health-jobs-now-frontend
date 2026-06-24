# HealthJobsNow API Reference

This document provides details of all backend API endpoints available in the HealthJobsNow backend service.

* **Base URL:** `http://localhost:8080`
* **Swagger/OpenAPI Documentation:** `http://localhost:8080/swagger-ui/index.html`
* **Authentication Method:** JWT (JSON Web Token)
  * Attach the token to protected requests using the header: 
    `Authorization: Bearer <your-access-token>`

---

## 1. Authentication & User Management Endpoints (`/api/auth`)

### 🔑 User Registration
* **Endpoint:** `POST /api/auth/register`
* **Access:** Public (Anyone can register)
* **Request Body (`application/json`):**
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["ROLE_JOB_SEEKER"] 
  }
  ```
  *(Note: Possible roles are `ROLE_JOB_SEEKER`, `ROLE_EMPLOYER`, and `ROLE_ADMIN`. If `roles` is omitted, it defaults to `ROLE_JOB_SEEKER`.)*
* **Response Body (`200 OK` on success):**
  ```json
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["JOB_SEEKER"]
  }
  ```

### 🔑 Local Login
* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Request Body (`application/json`):**
  ```json
  {
    "username": "john_doe",
    "password": "Password123!"
  }
  ```
* **Response Body (`200 OK` on success):**
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["JOB_SEEKER"]
    }
  }
  ```

### 👤 Current User Profile
* **Endpoint:** `GET /api/auth/profile`
* **Access:** Requires Valid JWT Token
* **Response Body (`200 OK` on success):**
  ```json
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["JOB_SEEKER"]
  }
  ```

### 🌐 Google OAuth2 Social Login
* **Login URL:** `/oauth2/authorization/google` (Handled automatically by Spring Security)
* **Success Callback behavior:** Upon successful authentication, the server intercepts the request and responds with the following JSON containing the JWT:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "tokenType": "Bearer"
  }
  ```

---

## 2. Job Endpoints (`/api/jobs`)

### 📋 Get All Jobs (Paginated)
* **Endpoint:** `GET /api/jobs`
* **Access:** Public
* **Query Parameters (All optional with defaults):**
  * `page` (default: `0`): Page index.
  * `size` (default: `10`): Number of items per page.
  * `sortBy` (default: `createdDate`): Property to sort by.
  * `direction` (default: `desc`): Sort order (`asc` or `desc`).
* **Response Body (`200 OK` on success):**
  ```json
  {
    "content": [
      {
        "id": 1,
        "title": "Healthcare Assistant",
        "description": "Provide daily care to patients in the hospital clinic.",
        "company": "City Health Hospital",
        "location": "New York, NY",
        "salary": "$50,000 - $60,000",
        "employmentType": "Full-Time",
        "experienceLevel": "Entry-Level",
        "postedDate": "2026-06-18T07:28:02",
        "createdDate": "2026-06-18T07:28:02",
        "lastModifiedDate": "2026-06-18T07:28:02"
      }
    ],
    "pageable": { ... },
    "totalPages": 1,
    "totalElements": 1,
    "last": true,
    "size": 10,
    "number": 0,
    "sort": { ... },
    "numberOfElements": 1,
    "first": true,
    "empty": false
  }
  ```

### 🔍 Get Job by ID
* **Endpoint:** `GET /api/jobs/{id}`
* **Access:** Requires Authenticated User (with any role: `EMPLOYER`, `ADMIN`, or `JOB_SEEKER`)
* **Response Body (`200 OK`):**
  ```json
  {
    "id": 1,
    "title": "Healthcare Assistant",
    "description": "Provide daily care to patients in the hospital clinic.",
    "company": "City Health Hospital",
    "location": "New York, NY",
    "salary": "$50,000 - $60,000",
    "employmentType": "Full-Time",
    "experienceLevel": "Entry-Level",
    "postedDate": "2026-06-18T07:28:02",
    "createdDate": "2026-06-18T07:28:02",
    "lastModifiedDate": "2026-06-18T07:28:02"
  }
  ```

### ➕ Create a Job Listing
* **Endpoint:** `POST /api/jobs`
* **Access:** Requires JWT + Role: `EMPLOYER` or `ADMIN`
* **Request Body (`application/json`):**
  ```json
  {
    "title": "Registered Nurse",
    "description": "Looking for a registered nurse to support our outpatient surgical facility.",
    "company": "Surgical Care Center",
    "location": "Los Angeles, CA",
    "salary": "$85,000 - $95,000",
    "employmentType": "Full-Time",
    "experienceLevel": "Mid-Level"
  }
  ```
* **Response Body (`201 Created`):** Returns the created `JobDto` representation.

### ✏️ Update a Job Listing
* **Endpoint:** `PUT /api/jobs/{id}`
* **Access:** Requires JWT + (Role: `ADMIN` OR must be the original `EMPLOYER` who posted the job)
* **Request Body (`application/json`):**
  *(Same structure as Create Job Request)*
* **Response Body (`200 OK`):** Returns the updated `JobDto` representation.

### ❌ Delete a Job Listing
* **Endpoint:** `DELETE /api/jobs/{id}`
* **Access:** Requires JWT + (Role: `ADMIN` OR must be the original `EMPLOYER` who posted the job)
* **Response (`204 No Content` on successful deletion)**
