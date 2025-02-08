import React from "react";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';

function ClearCacheButton() {

  const navigate = useNavigate();


  // Function to clear localStorage and refresh the page
  const clearLocalStorage = () => {
    localStorage.clear();
    Swal.fire('Success', 'Local storage cleared!', 'success');
    navigate("/sign-in");
  };

  return (
    <Button
      className="action-btn"
      variant="outline-danger"
      onClick={clearLocalStorage}
      style={{
        cursor: "pointer",
      }}
    >
      <i class="fas fa-trash-alt" style={{ marginRight: 6 + "px" }}></i>
      Clear Cache
    </Button>
  );
}

export default ClearCacheButton;
