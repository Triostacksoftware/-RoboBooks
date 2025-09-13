import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; entryId: string } }
) {
  try {
    const { projectId, entryId } = params;
    const response = await fetch(`${BACKEND_URL}/api/projects/${projectId}/time-entries/${entryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching project time entry:', error);
    return NextResponse.json({ error: 'Failed to fetch time entry' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; entryId: string } }
) {
  try {
    const { projectId, entryId } = params;
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/projects/${projectId}/time-entries/${entryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating project time entry:', error);
    return NextResponse.json({ error: 'Failed to update time entry' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; entryId: string } }
) {
  try {
    const { projectId, entryId } = params;
    
    const response = await fetch(`${BACKEND_URL}/api/projects/${projectId}/time-entries/${entryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting project time entry:', error);
    return NextResponse.json({ error: 'Failed to delete time entry' }, { status: 500 });
  }
}
