import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AppNavbar from "./components/AppNavBar.jsx"; 
import "./App.css"; 
import SearchPage from "./pages/SearchPage.jsx";
import PublishAccommodation from "./pages/PublishAccommodation.jsx";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
  
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
  }, []);
  
  return (
    <div className="app-container"> 
      <Router>
        {user && <AppNavbar />}  
        <div className="content">
          <Routes>
            <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/publish-accommodation" element={<PublishAccommodation />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
