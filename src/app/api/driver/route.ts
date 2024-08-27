import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
export const GET = async (req: NextRequest) => {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const response = await sql`select * from drivers`;
    return NextResponse.json({ data: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
