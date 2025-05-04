'use client'

import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login } = useAuth();

  return (
    <div>
      <h1>Login</h1>
      <button onClick={login}>Login with Google</button>
    </div>
  );
}