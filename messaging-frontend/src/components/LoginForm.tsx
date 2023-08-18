import React, { type FormEvent } from 'react';
import { useAuthContext } from '../AuthContext';

const LoginForm: React.FC = () => {
  const { username, password, isLoggedIn, setLoggedIn, setUsername, setPassword } = useAuthContext();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      console.log(response.body);
      setUsername(username); // Set username in AuthContext
      setPassword(password); // Set password in AuthContext
      console.log('username: ', username);
      console.log('password: ', password);
      setLoggedIn(true); // Update login status in AuthContext
      console.log('is logged in: ', isLoggedIn);
      // set username and password in local storage
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
      localStorage.setItem('isLoggedIn', 'true');
      // Add logic to handle successful login (e.g., navigate to messaging page).
      window.location.href = '/messaging';
    } catch (error) {
      console.error(error);
      // Add logic to handle login error (e.g., show an error message).
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
