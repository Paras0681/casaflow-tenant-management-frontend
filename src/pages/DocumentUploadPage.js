import React, { useState } from "react";

const DocumentUploadPage = () => {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (file) {
      alert(`Document Uploaded: ${file.name}`);
    }
  };

  return (
    <div>
      <h1>Upload Documents</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default DocumentUploadPage;
