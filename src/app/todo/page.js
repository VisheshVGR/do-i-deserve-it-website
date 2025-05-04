'use client'

import withAuth from '@/utils/withAuth';

function Todo() {
  return (
    <div>
      <h1>Todo</h1>
      <p>This is the content for the /todo route.</p>
    </div>
  );
}

export default withAuth(Todo);
