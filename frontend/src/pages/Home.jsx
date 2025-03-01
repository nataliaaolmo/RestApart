/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Helmet from "react-helmet";
import "../static/resources/css/Home.css"

// eslint-disable-next-line react/prop-types
function Home({ user }) {
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    }
  }, [user]);

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
