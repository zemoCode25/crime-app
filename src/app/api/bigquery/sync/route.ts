import { NextRequest, NextResponse } from 'next/server';
import { bigquery, dataset } from '@/lib/bigquery';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { table, record, type } = payload; // type: INSERT, UPDATE, DELETE

    if (table === 'crime_case') {
      const bqTable = dataset.table('crime_cases');
      
      if (type === 'INSERT' || type === 'UPDATE') {
        const row = {
          id: record.id,
          case_number: record.case_number,
          case_status: record.case_status,
          // ... map all fields
          incident_datetime: record.incident_datetime,
          created_at: record.created_at || new Date().toISOString(),
        };

        await bqTable.insert([row]);
      } else if (type === 'DELETE') {
        const query = `
          DELETE FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.crime_analytics.crime_cases\`
          WHERE id = @id
        `;
        
        await bigquery.query({
          query,
          params: { id: record.id },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}