import { NextRequest, NextResponse } from 'next/server';
import { setVariantStatus, Status } from '@/lib/data';

const VALID_STATUSES: Status[] = ['ready_for_review', 'approved', 'launched', 'cancelled', 'need_fixes'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) {
    return NextResponse.json(
      { error: 'Missing Authorization: Bearer <token> header' },
      { status: 401 }
    );
  }

  let body: { status?: string } | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body?.status || !VALID_STATUSES.includes(body.status as Status)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const updated = setVariantStatus(id, token, body.status as Status);
  if (!updated) {
    return NextResponse.json({ error: 'Variant not found or token mismatch' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
