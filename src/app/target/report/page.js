'use client';

import withAuth from '@/utils/withAuth';

function Report() {
  return (
    <div>
      <h1>Report</h1>
      <p>This is the content for the /Report route.</p>
    </div>
  );
}

export default withAuth(Report);