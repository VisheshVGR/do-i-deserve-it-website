'use client'

import withAuth from '@/utils/withAuth';

function Reminder() {
  return (
    <div>
      <h1>reminder</h1>
      <p>This is the content for the /reminder route.</p>
    </div>
  );
}

export default withAuth(Reminder);
