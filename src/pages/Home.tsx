import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import './Home.css';

const Home: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="home-container">
      <div className="auth-container">
        <div className="auth-tabs">
          <button 
            className={`tab-button ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`tab-button ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>
        
        <div className="auth-content">
          {isLogin ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  );
};

export default Home;
