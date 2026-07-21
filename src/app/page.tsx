import React from 'react';
import { getDbData } from '@/lib/db';
import DashboardContainer from '@/components/DashboardContainer';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch initial dataset on the server
  const data = await getDbData();

  return <DashboardContainer initialData={data} />;
}
