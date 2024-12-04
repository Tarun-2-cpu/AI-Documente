import React from "react";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";


function ClearCacheButton() {

  const navigate = useNavigate();


  // Function to clear localStorage and refresh the page
  const clearLocalStorage = () => {
    localStorage.clear();
    Swal.fire('Success', 'Local storage cleared!', 'success');
    navigate("/sign-in");
  };

  return (
    <button
      className="btn btn-danger rounded-pill px-3 py-2"
      onClick={clearLocalStorage}
      style={{
        backgroundColor: "#dc3545",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
    >
      Clear Cache
    </button>
  );
}

export default ClearCacheButton;
