import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Transactions.css";

function Transactions() {
  const navigate = useNavigate();

  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");

  async function handleTransaction(e) {
    e.preventDefault();

    console.log("ACCOUNT:", toAccountNumber);
    console.log("AMOUNT:", amount);
    console.log("PIN:", pin);

    if (!toAccountNumber || !amount || !pin) {
      alert("Account number and amount transaction PIN are required");
      return;
    }

    if (Number(amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      // 1. Receiver account find karo
      const accountResponse = await api.get(
        `/accounts/number/${toAccountNumber}`,
      );

      const receiverAccount = accountResponse.data.account;

      console.log("RECEIVER:", receiverAccount);

      // 2. Apna account nikalo
      const myAccountResponse = await api.get("/accounts");

      const myAccounts = myAccountResponse.data.accounts || [];

      if (myAccounts.length === 0) {
        alert("You don't have a bank account");

        return;
      }

      const myAccount = myAccounts[0];

      // 3. Khud ko money send nahi kar sakte
      if (String(myAccount._id) === String(receiverAccount._id)) {
        alert("You cannot send money to your own account");

        return;
      }

      // 4. Unique idempotency key
      const idempotencyKey =
        "TXN-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8);

      // 5. Transaction create
      const response = await api.post("/transactions", {
        fromAccount: myAccount._id,

        toAccount: receiverAccount._id,

        amount: Number(amount),

        idempotencyKey,
        pin,
        bankname: "vidhema",
      });

      console.log("TRANSACTION SUCCESS:", response.data);

      alert("Transaction completed successfully!");

      setToAccountNumber("");
      setAmount("");
      setPin("");

      navigate("/dashboard");
    } catch (error) {
      console.log("TRANSACTION ERROR:", error.response?.data || error.message);

      alert(error.response?.data?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="transaction-page">
      <div className="transaction-box">
        <h1>💸 Send Money</h1>

        <p>Transfer money to another bank account</p>

        <form onSubmit={handleTransaction}>
          <label>Receiver Account Number</label>

          <input
            type="text"
            placeholder="Enter account number"
            value={toAccountNumber}
            onChange={(e) => setToAccountNumber(e.target.value)}
          />

          <label>Amount</label>

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <label>Transfer PIN</label>

          <input
            type="password"
            inputMode="numeric"
            placeholder="Enter transaction PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            maxLength={4}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Send Money"}
          </button>
        </form>

        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Transactions;
