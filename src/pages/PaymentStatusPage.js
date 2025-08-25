import React from "react";

const PaymentStatusPage = () => {
  const payments = [
    { tenant: "Rahul Sharma", paid: 10000, pending: 2000 },
    { tenant: "Anita Deshmukh", paid: 8000, pending: 0 },
  ];

  return (
    <div>
      <h1>Payment Status</h1>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Paid</th>
            <th>Pending</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p, i) => (
            <tr key={i}>
              <td>{p.tenant}</td>
              <td>₹{p.paid}</td>
              <td>₹{p.pending}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentStatusPage;
