import React from 'react';

export default function Signup() {
  return (
    <div className="signup-page">
      <h2>Sign Up</h2>
      <form>
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
}
