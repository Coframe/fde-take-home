import { NextRequest, NextResponse } from 'next/server';
import { getComments, addComment } from '@/lib/data';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comments = getComments(id);
  if (comments === null) {
    return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
  }
  return NextResponse.json({ variantId: id, comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { text?: string; author?: string } | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body?.text || !body?.author) {
    return NextResponse.json({ error: 'Required fields: text, author' }, { status: 400 });
  }

  const comment = addComment(id, body.author, body.text);
  if (!comment) {
    return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
  }

  return NextResponse.json(comment, { status: 201 });
}
