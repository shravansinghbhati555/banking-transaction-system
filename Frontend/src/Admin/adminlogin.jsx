import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Email and password are required");

      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/adminlogin", formData);

      console.log("ADMIN LOGIN:", response.data);

      const token = response.data.token
      if(!token){
        alert("Admin token not received")
        return
      }

      localStorage.setItem("token", token)
      console.log("Admin token saved", token);


      alert("Admin login successful");

      navigate("/admindashboard");
    } catch (error) {
      console.log("ADMIN LOGIN ERROR:", error.response?.data || error.message);

      alert(error.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-icon">🏦</div>

        <h1>Admin Login</h1>

        <p>Login to Bank Administration Panel</p>

        <form onSubmit={handleLogin}>
          <label>Admin Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter admin email"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>

        <button
          className="user-login-button"
          onClick={() => navigate("/login")}
        >
          ← Back to User Login
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;
