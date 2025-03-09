import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Helmet from "react-helmet";
import "../static/resources/css/Home.css";

function Home({ user }) {
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
        try {
            setCurrentUser(JSON.parse(storedUser)); 
        } catch (error) {
            localStorage.removeItem("user"); 
        }
    }
  }, []);

  return (
    <div className="home-container">
      <main className="home-main">
        <h2 className="welcome-text">
          Hola usuario: {currentUser?.username || "Desconocido"}
        </h2>
      </main>
    </div>
  );
}

export default Home;
