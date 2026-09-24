import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

import "./Dashboard.css";



function Dashboard() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);

  const [balance, setBalance] = useState(0);

  const [accountNumber, setAccountNumber] = useState("");

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==============================
  // GET ACCOUNT
  // ==============================

  async function getAccount() {
    try {
      const response = await api.get("/accounts");

      console.log("ACCOUNTS:", response.data);

      const userAccounts = response.data.accounts || [];

      setAccounts(userAccounts);

      if (userAccounts.length > 0) {
        const account = userAccounts[0];

        setAccountNumber(account.accountNumber);

        const balanceResponse = await api.get(
          `/accounts/balance/${account._id}`,
        );

        console.log("BALANCE:", balanceResponse.data);

        setBalance(balanceResponse.data.balance || 0);
      } else {
        setAccountNumber("");

        setBalance(0);
      }
    } catch (error) {
      console.log("ACCOUNT ERROR:", error.response?.data || error.message);

      setError(error.response?.data?.message || "Unable to load account");
    }
  }

  // ==============================
  // CREATE ACCOUNT
  // ==============================

  async function createAccount() {
    try {
      setError("");

      const response = await api.post("/accounts");

      console.log("ACCOUNT CREATED:", response.data);

      alert("Account created successfully!");

      await getAccount();
    } catch (error) {
      console.log(
        "CREATE ACCOUNT ERROR:",
        error.response?.data || error.message,
      );

      alert(error.response?.data?.message || "Account creation failed");
    }
  }

  // ==============================
  // GET TRANSACTIONS
  // ==============================

  async function getTransactions() {
    try {
      const response = await api.get("/transactions");

      console.log("TRANSACTIONS:", response.data);

      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.log("TRANSACTION ERROR:", error.response?.data || error.message);
    }
  }

  // ==============================
  // LOAD DASHBOARD
  // ==============================

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      await Promise.all([getAccount(), getTransactions()]);

      setLoading(false);
    }

    loadDashboard();
  }, []);

   
  // LOGOUT
   

  async function handleLogout() {
    try {
      await api.post("/auth/logout");

      alert("Logout successful");

      navigate("/login");
    } catch (error) {
      console.log("LOGOUT ERROR:", error.response?.data || error.message);

      alert("Logout failed");
    }
  }

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>

        <h2>Loading Dashboard...</h2>

        <p>Please wait</p>
      </div>
    );
  }

  // ==============================
  // DASHBOARD
  // ==============================

  return (
    <div className="dashboard">
      {/* NAVBAR */}

      <nav className="dashboard-navbar">
        <h2>🏦 MyBank</h2>

        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>

          <Link to="/transactions">Transactions</Link>

          <Link to="/profile">Profile</Link>

          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* CONTENT */}

      <main className="dashboard-content">
        {/* WELCOME */}

        <div className="welcome">
          <h1>Welcome Back 👋</h1>

          <p>Manage your bank account and transactions</p>
        </div>

        {/* ERROR */}

        {error && <div className="dashboard-error">{error}</div>}

        {/* ACCOUNT */}

        {accounts.length === 0 ? (
          <div className="create-account-card">
            <h2>🏦 Create Your Bank Account</h2>

            <p>You don't have a bank account yet.</p>

            <button onClick={createAccount}>Create Account</button>
          </div>
        ) : (
          <>
            {/* ACCOUNT DETAILS */}

            <div className="account-details">
              <div>
                <p>Account Number</p>

                <h2>{accountNumber}</h2>
              </div>

              <div>
                <p>Available Balance</p>

                <h2>₹{Number(balance).toLocaleString("en-IN")}</h2>
              </div>

              <div>
                <p>Account Status</p>

                <h2>ACTIVE</h2>
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <section className="quick-actions">
              <h2>Quick Actions</h2>

              <div className="action-buttons">
                <button type="button" onClick={() => navigate("/transactions")}>
                  💸 Send Money
                </button>

                <button type="button" onClick={() => navigate("/transactions")}>
                  📋 Transactions
                </button>

                <button type="button" onClick={() => navigate("/profile")}>
                  👤 My Profile
                </button>
              </div>
            </section>

            {/* RECENT TRANSACTIONS */}

            <section className="recent-transactions">
              <div className="transaction-header">
                <h2>Recent Transactions</h2>

                <Link to="">View All</Link>
              </div>

              {transactions.length === 0 ? (
                <div className="no-transactions">
                  <p>No transactions found.</p>
                </div>
              ) : (
                transactions.slice(0, 5).map((transaction) => {
                  const isReceived = accounts.some(
                    (account) =>
                      String(account._id) ===
                      String(transaction.toAccount?._id),
                  );

                  return (
                    <div className="transaction" key={transaction._id}>
                      <div className="transaction-info">
                        <h3>{isReceived ? "Money Received" : "Money Sent"}</h3>

                        <p>transaction ID: {transaction.transactionId}</p>

                        <p>
                          {new Date(transaction.createdAt).toLocaleString(
                            "en-IN",
                          )}
                        </p>

                        <small>Status: {transaction.status}</small>
                      </div>

                      <strong className={isReceived ? "credit" : "debit"}>
                        {isReceived ? "+" : "-"}₹
                        {Number(transaction.amount).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  );
                })
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
