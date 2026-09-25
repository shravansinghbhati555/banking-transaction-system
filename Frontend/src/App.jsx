
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "./Pages/register";
import Login from "./Pages/login";
import Dashboard from "./Pages/dashboard"
import AdminLogin from "./Admin/adminlogin";
import AdminDashboard from "./Admin/admindashborad";
import Transactions from "./Pages/transactions";
import Verifyotp from "./Pages/VerifyOTP"
import Profile from "./Pages/profile";
import Tranferdetails from "./Pages/transactiondetails"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route */}
        <Route path="/" element={<Navigate to="/register" />} />

        {/* User routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<Verifyotp />} />

        <Route path="/transactiondetails" element={<Tranferdetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin route */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
