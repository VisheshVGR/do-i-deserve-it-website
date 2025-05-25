'use client';

import withAuth from '@/utils/withAuth';

function FriendsReportPage() {
  return (
    <div>
      <h1>Friends Report</h1>
      <p>This is the content for the /Friends route.</p>
    </div>
  );
}

export default withAuth(FriendsReportPage);
