'use client';

import withAuth from '@/utils/withAuth';

function FriendsPage() {
  return (
    <div>
      <h1>Friends</h1>
      <p>This is the content for the /Friends route.</p>
    </div>
  );
}

export default withAuth(FriendsPage);