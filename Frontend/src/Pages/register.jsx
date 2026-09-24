import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const transactionSearch = async () => {
    if (!searchId.trim()) {
      alert("Please enter Transaction ID");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3000/api/transactions/${searchId.trim()}`,
         
      );

      navigate("/transactiondetails", {
        state: {
          transaction: response.data.transaction,
           
        },
      });
    } catch (error) {
      alert(error.response?.data?.message || "Transaction not found");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password check
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        },
      );

      console.log("Register Response:", response.data);

      // OTP page par redirect
      navigate("/verify-otp", {
        state: {
          email: formData.email,
        },
      });
    } catch (error) {
      console.error("Register Error:", error);

      console.log("RESPONSE DATA:", error.response?.data);
      console.log("STATUS:", error.response?.status);

      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Admin Login */}
      <Link to="/adminlogin" className="admin-login">
        🛡️
        <span>Admin Login</span>
      </Link>

      <div className="register-container">
        {/* Left Section */}
        <div className="register-left">
          <div className="bank-logo">🏦</div>

          <h1>SecureBank</h1>

          <p>
            Safe, secure and simple banking
            <br />
            at your fingertips.
          </p>

          <div className="security-info">
            🔒 Your information is securely protected
          </div>

          <div className="transaction-search">
            <input
              type="text"
              placeholder="Search by Transaction ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />

            <button onClick={transactionSearch} type="button">🔍 Search</button>
          </div>
        </div>

        {/* Register Card */}
        <div className="register-card">
          <h2>Create Account</h2>

          <p className="subtitle">Register to start using SecureBank</p>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="input-group">
              <label>Full Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="input-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <label>Confirm Password</label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Send OTP */}
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Create Account"}
            </button>
          </form>

          {/* Login Navigation */}
          <p className="login-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
