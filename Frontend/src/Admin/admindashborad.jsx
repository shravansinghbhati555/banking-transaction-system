import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAccounts: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
  });

  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);

  // ==========================
  // LOAD DASHBOARD
  // ==========================

  useEffect(() => {
    loadStats();
    loadUsers();
    loadAccounts();
    loadTransactions();
  }, []);

  // ==========================
  // STATS
  // ==========================

  async function loadStats() {
    try {
      const response = await api.get("/admin/stats");

      console.log("ADMIN STATS:", response.data);

      setStats(response.data.stats);
    } catch (error) {
      console.log("STATS ERROR:", error.response?.data || error.message);

      handleUnauthorized(error);
    }
  }

  //tranfer details
  async function handleTransactionClick(transactionId) {
    try {
      const response = await api.get(`/transactions/${transactionId}`);

      navigate("/transactiondetails", {
        state: {
          transaction: response.data.transaction,
        },
      });
    } catch (error) {
      console.log(
        "TRANSACTION DETAILS ERROR:",
        error.response?.data || error.message,
      );

      alert(error.response?.data?.message || "Transaction details not found");
    }
  }

  // ==========================
  // USERS
  // ==========================

  async function loadUsers() {
    try {
      const response = await api.get("/admin/users");

      console.log("USERS:", response.data);

      setUsers(response.data.users || []);
    } catch (error) {
      console.log("USERS ERROR:", error.response?.data || error.message);

      handleUnauthorized(error);
    }
  }

  // ==========================
  // ACCOUNTS
  // ==========================

  async function loadAccounts() {
    try {
      const response = await api.get("/admin/accounts");

      console.log("ACCOUNTS:", response.data);

      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.log("ACCOUNTS ERROR:", error.response?.data || error.message);

      handleUnauthorized(error);
    }
  }

  // ==========================
  // TRANSACTIONS
  // ==========================

  async function loadTransactions() {
    try {
      const response = await api.get("/admin/transactions");

      console.log("TRANSACTIONS:", response.data);

      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.log("TRANSACTIONS ERROR:", error.response?.data || error.message);

      handleUnauthorized(error);
    }
  }

  // ==========================
  // UNAUTHORIZED
  // ==========================

  function handleUnauthorized(error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      navigate("/adminlogin");
    }
  }

  // ==========================
  // ADD MONEY
  // ==========================

  async function handleAddMoney(e) {
    e.preventDefault();

    if (!accountNumber || !amount) {
      alert("Account number and amount are required");

      return;
    }

    if (Number(amount) <= 0) {
      alert("Amount must be greater than 0");

      return;
    }

    try {
      setLoading(true);

      // Find target account
      const accountResponse = await api.get(
        `/accounts/number/${accountNumber}`,
      );

      const account = accountResponse.data.account;

      console.log("TARGET ACCOUNT:", account);

      // Unique idempotency key
      const idempotencyKey =
        "INITIAL-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2, 8);

      // Add money
      const response = await api.post("/transactions/system/initial-funds", {
        toAccount: account._id,
        amount: Number(amount),
        idempotencyKey,
      });

      console.log("MONEY ADDED:", response.data);

      alert("Money added successfully!");

      setAccountNumber("");
      setAmount("");

      await loadStats();
      await loadTransactions();
    } catch (error) {
      console.log("ADD MONEY ERROR:", error.response?.data || error.message);

      alert(error.response?.data?.message || "Money add failed");
    } finally {
      setLoading(false);
    }
  }

  // ==========================
  // LOGOUT
  // ==========================

  async function handleLogout() {
    try {
      await api.post("/auth/logout");

      navigate("/adminlogin");
    } catch (error) {
      console.log("LOGOUT ERROR:", error);
    }
  }

  return (
    <div className="admin-layout">
      {/* =====================
                SIDEBAR
            ====================== */}

      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-icon">🏦</div>

          <div>
            <h2>BankAdmin</h2>
            <span>Management Panel</span>
          </div>
        </div>

        <nav>
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            📊 Dashboard
          </button>

          <button
            className={activeTab === "add-money" ? "active" : ""}
            onClick={() => setActiveTab("add-money")}
          >
            💰 Add Money
          </button>

          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            👥 Users
          </button>

          <button
            className={activeTab === "transactions" ? "active" : ""}
            onClick={() => setActiveTab("transactions")}
          >
            💳 Transactions
          </button>
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* =====================
                MAIN
            ====================== */}

      <main className="admin-main">
        {/* HEADER */}

        <header className="admin-topbar">
          <div>
            <h1>
              {activeTab === "dashboard"
                ? "Dashboard"
                : activeTab === "add-money"
                  ? "Add Money"
                  : activeTab === "users"
                    ? "Users"
                    : "All Transactions"}
            </h1>

            <p>Welcome back, Administrator</p>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>

            <div>
              <strong>Administrator</strong>
              <span>System User</span>
            </div>
          </div>
        </header>

        {/* =====================
                    DASHBOARD
                ====================== */}

        {activeTab === "dashboard" && (
          <section>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>

                <div>
                  <span>Total Users</span>

                  <h2>{stats.totalUsers}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏦</div>

                <div>
                  <span>Total Accounts</span>

                  <h2>{stats.totalAccounts}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💳</div>

                <div>
                  <span>Transactions</span>

                  <h2>{stats.totalTransactions}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>

                <div>
                  <span>Completed</span>

                  <h2>{stats.completedTransactions}</h2>
                </div>
              </div>
            </div>

            {/* QUICK ACTION */}

            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>Quick Actions</h2>

                  <p>Manage banking operations</p>
                </div>
              </div>

              <div className="quick-actions">
                <button onClick={() => setActiveTab("add-money")}>
                  💰 Add Money
                </button>

                <button onClick={() => setActiveTab("users")}>
                  👥 View Users
                </button>

                <button onClick={() => setActiveTab("transactions")}>
                  💳 All Transactions
                </button>
              </div>
            </div>

            {/* RECENT TRANSACTIONS */}

            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>Recent Transactions</h2>

                  <p>Latest banking activity</p>
                </div>

                <button
                  className="view-button"
                  onClick={() => setActiveTab("transactions")}
                >
                  View All
                </button>
              </div>

              <TransactionTable transactions={transactions.slice(0, 5)}
               onTransactionClick={handleTransactionClick} />
            </div>
          </section>
        )}

        {/* =====================
                    ADD MONEY
                ====================== */}

        {activeTab === "add-money" && (
          <section>
            <div className="dashboard-card add-money-card">
              <div className="card-header">
                <div>
                  <h2>💰 Add Money</h2>

                  <p>Add initial funds to customer's account</p>
                </div>
              </div>

              <form className="add-money-form" onSubmit={handleAddMoney}>
                <label>Account Number</label>

                <input
                  type="text"
                  placeholder="Enter customer account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />

                <label>Amount</label>

                <input
                  type="number"
                  placeholder="Enter amount"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                  {loading ? "Processing..." : "💰 Add Money"}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* =====================
                    USERS
                ====================== */}

        {activeTab === "users" && (
          <section>
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>👥 Registered Users</h2>

                  <p>All users registered in the system</p>
                </div>

                <span className="count-badge">{users.length} Users</span>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <strong>{user.name}</strong>
                          </td>

                          <td>{user.email}</td>

                          <td>
                            <span
                              className={
                                user.systemUser ? "role-admin" : "role-user"
                              }
                            >
                              {user.systemUser ? "ADMIN" : "USER"}
                            </span>
                          </td>

                          <td>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACCOUNTS */}

            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>🏦 Bank Accounts</h2>

                  <p>Customer account information</p>
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Account Number</th>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account._id}>
                        <td>
                          <strong>{account.accountNumber}</strong>
                        </td>

                        <td>{account.user?.name || "N/A"}</td>

                        <td>{account.user?.email || "N/A"}</td>

                        <td>
                          <span
                            className={
                              account.status === "ACTIVE"
                                ? "status-completed"
                                : "status-failed"
                            }
                          >
                            {account.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* =====================
                    TRANSACTIONS
                ====================== */}

        {activeTab === "transactions" && (
          <section>
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>💳 All Transactions</h2>

                  <p>Complete transaction history</p>
                </div>

                <span className="count-badge">
                  {transactions.length} Transactions
                </span>
              </div>

              <TransactionTable transactions={transactions}
              onTransactionClick={handleTransactionClick} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// =================================
// TRANSACTION TABLE COMPONENT
// =================================

function TransactionTable({ transactions, onTransactionClick }) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div>💳</div>
        <h3>No Transactions</h3>
        <p>There are no transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>From Account</th>
            <th>To Account</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction._id}
              onClick={() => onTransactionClick(transaction.transactionId)}
              className="transaction-row"
            >
              <td>{transaction.fromAccount?.accountNumber || "N/A"}</td>

              <td>{transaction.toAccount?.accountNumber || "N/A"}</td>

              <td>
                <strong>₹{transaction.amount}</strong>
              </td>

              <td>
                <span
                  className={
                    transaction.status === "COMPLETED"
                      ? "status-completed"
                      : transaction.status === "PENDING"
                        ? "status-pending"
                        : "status-failed"
                  }
                >
                  {transaction.status}
                </span>
              </td>

              <td>{new Date(transaction.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
