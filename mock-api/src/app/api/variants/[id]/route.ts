import { NextRequest, NextResponse } from 'next/server';
import { deleteVariant } from '@/lib/data';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) {
    return NextResponse.json({ error: 'Missing Authorization: Bearer <token> header' }, { status: 401 });
  }

  const deleted = deleteVariant(id, token);
  if (!deleted) {
    return NextResponse.json({ error: 'Variant not found or token mismatch' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
