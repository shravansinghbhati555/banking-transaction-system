 # 🏦 Backing Transaction System

A full-stack banking transaction management application built using the MERN stack. It allows users to manage their accounts, transfer money securely, view transaction history, and manage their profiles. It also includes an admin panel for managing users, accounts, and transactions.

---

## 🚀 Features

### 👤 User Features

* User Registration and Login
* Secure Authentication using JWT and Cookies
* User Profile Management
* Profile Photo Upload
* Set and Verify Transaction PIN
* View Account Balance
* Transfer Money to Other Accounts
* Secure Transactions with PIN Verification
* View Transaction History
* Search Transactions using Transaction ID
* Email Notifications for Transactions
* Logout Functionality

### 🛡️ Admin Features

* Admin Login
* Admin Dashboard
* View and Manage Users
* View and Manage Bank Accounts
* View All Transactions
* Monitor Transaction Status
* Add Initial Funds to Accounts
* Block and Unblock Accounts

### 💳 Transaction Features

* Unique Transaction ID Generation
* Idempotency Key Support
* Ledger-Based Balance Management
* Transaction Status Tracking
* Pending, Completed, Failed, and Reversed Statuses
* Transaction Validation and Error Handling

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router DOM
* Axios
* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* bcrypt
* Cookie Parser
* Nodemailer
* Multer

### Deployment

* Frontend: Netlify / Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## 📂 Project Structure


Backing/
│
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
│
└── README.md

*Note: Folder names may vary depending on your actual project structure.*

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/shravansinghbhati555/banking-transaction-system.git
```

### 2. Navigate to the Project

```bash
cd banking-transaction-system
```

### 3. Setup Backend

```bash
cd Backend
npm install
```

Create a `.env` file inside the `Backend` folder.

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Add any additional environment variables required by your backend, such as email credentials and frontend origin.

Start the backend:

```bash
npm run dev
```

### 4. Setup Frontend

Open a new terminal:

```bash
cd Frontend
npm install
```

Create a `.env` file inside the `Frontend` folder.

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL shown in your terminal to access the application.

---

## 🔗 API Routes

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| POST   | `/api/auth/register`    | Register a new user      |
| POST   | `/api/auth/login`       | User login               |
| POST   | `/api/auth/adminlogin`  | Admin login              |
| GET    | `/api/accounts`         | Get account information  |
| GET    | `/api/transactions`     | Get transaction history  |
| POST   | `/api/transactions`     | Create a transaction     |
| GET    | `/api/transactions/:id` | Search transaction by ID |
| GET    | `/api/admin`            | Admin operations         |

*These are example route descriptions. Check your backend routes for the exact endpoints and HTTP methods.*

---

## 🔐 Security

* Password hashing using bcrypt
* JWT-based authentication
* Protected routes using authentication middleware
* Transaction PIN verification
* Account status validation
* Idempotency support to help prevent duplicate transactions
* Ledger-based balance tracking

---

## 🌐 Live Demo

**Frontend:** [Open Live Application](https://incredible-dodol-9275fc.netlify.app/login)

**Backend:** [Backend API](https://banking-transaction-system-9fbp.onrender.com)

---

## 👨‍💻 Developer

**Shravan Singh**

* GitHub: [@shravansinghbhati555](https://github.com/shravansinghbhati555)

---

## 📄 License

This project is developed for learning and demonstration purposes.
