import { useLocation, useNavigate } from "react-router-dom";
import "./transactiondetelis.css";

const TransactionDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const transaction = location.state?.transaction;

  if (!transaction) {
    return (
      <div className="transactions-page">
        <div className="transaction-card">
          <h2>No Transaction Selected</h2>

          <p>
            Please search for a valid Transaction ID.
          </p>

          <button onClick={() => navigate("/register")}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <div className="transaction-card">

        <h2>Transaction Details</h2>

        <div className="transaction-status">
          {transaction.status}
        </div>

        <div className="transaction-details">

          <div className="detail-row">
            <span>Transaction ID</span>
            <strong>
              {transaction.transactionId}
            </strong>
          </div>

          <div className="detail-row">
            <span>Amount</span>
            <strong>
              ₹{transaction.amount}
            </strong>
          </div>

          <div className="detail-row">
            <span>From Account</span>
            <strong>
              {transaction.fromAccount?._id ||
                transaction.fromAccount}
            </strong>
          </div>

          <div className="detail-row">
            <span>To Account</span>
            <strong>
              {transaction.toAccount?._id ||
                transaction.toAccount}
            </strong>
          </div>

          <div className="detail-row">
            <span>Status</span>
            <strong>
              {transaction.status}
            </strong>
          </div>

          <div className="detail-row">
            <span>Created At</span>
            <strong>
              {transaction.createdAt
                ? new Date(
                    transaction.createdAt
                  ).toLocaleString()
                : "N/A"}
            </strong>
          </div>

          <div className="detail-row">
            <span>Updated At</span>
            <strong>
              {transaction.updatedAt
                ? new Date(
                    transaction.updatedAt
                  ).toLocaleString()
                : "N/A"}
            </strong>
          </div>

        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/register")}
        >
          ← Back to Register
        </button>

      </div>
    </div>
  );
};

export default TransactionDetails;