'use client'

import withAuth from '@/utils/withAuth';

function DoIDeserveIt() {
  return (
    <div>
      <h1>DoIDeserveIt</h1>
      <p>This is the content for the /do-i-deserve-it route.</p>
    </div>
  );
}

export default withAuth(DoIDeserveIt);