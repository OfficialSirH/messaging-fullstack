import React, { type FormEvent, useState } from 'react';

const RegistrationForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      console.log(response.body);
      // browser pop up that says in gen-z terms that the user has been registered
      alert('Your logino input was quite lit for the server, fam, and now you can continue, fr fr ong');
      // Add logic to handle successful registration (e.g., navigate to login page).
    } catch (error) {
      console.error(error);
      // Add logic to handle registration error (e.g., show an error message).
    }
  };

  return (
    <div className='form-container'>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
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
          Register
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
