import React, { useState } from "react";

const TenantFormPage = () => {
  const [form, setForm] = useState({ name: "", occupation: "", address: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    alert(`Tenant Data Submitted: ${JSON.stringify(form)}`);
  };

  return (
    <div>
      <h1>Tenant Profile Form</h1>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <br />
      <input name="occupation" placeholder="Occupation" onChange={handleChange} />
      <br />
      <input name="address" placeholder="Address" onChange={handleChange} />
      <br />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default TenantFormPage;
