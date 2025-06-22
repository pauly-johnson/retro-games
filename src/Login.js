import React from 'react';

export default function Login() {
  return (
    <div className="login-page">
      <h2>Login</h2>
      <form>
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p>Don&apos;t have an account? <a href="/signup">Sign up</a></p>
    </div>
  );
}
