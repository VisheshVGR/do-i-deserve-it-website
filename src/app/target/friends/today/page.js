'use client';

import withAuth from '@/utils/withAuth';

function FriendsTodayPage() {
  return (
    <div>
      <h1>Friends Today</h1>
      <p>This is the content for the /Friends route.</p>
    </div>
  );
}

export default withAuth(FriendsTodayPage);