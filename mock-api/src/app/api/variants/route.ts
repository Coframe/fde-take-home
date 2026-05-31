import { NextRequest, NextResponse } from 'next/server';
import { getVariants, createRandomVariant } from '@/lib/data';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const projectId = req.nextUrl.searchParams.get('projectId');

  if (!token || !projectId) {
    return NextResponse.json(
      { error: 'Missing required query params: token, projectId' },
      { status: 400 }
    );
  }

  const all = req.nextUrl.searchParams.get('status') === 'all';
  const variants = getVariants(token, projectId, all);

  const experimentsMap: Record<string, { id: string; name: string; variants: typeof variants }> = {};
  for (const v of variants) {
    if (!experimentsMap[v.experimentId]) {
      experimentsMap[v.experimentId] = { id: v.experimentId, name: v.experimentName, variants: [] };
    }
    experimentsMap[v.experimentId].variants.push(v);
  }

  return NextResponse.json({
    projectId,
    customerSlug: variants[0]?.customerSlug ?? null,
    totalPendingApproval: all ? undefined : variants.length,
    total: all ? variants.length : undefined,
    experiments: Object.values(experimentsMap),
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) {
    return NextResponse.json({ error: 'Missing Authorization: Bearer <token> header' }, { status: 401 });
  }
  const variant = createRandomVariant();
  if (variant.token !== token) {
    return NextResponse.json({ error: 'Token mismatch' }, { status: 403 });
  }
  return NextResponse.json(variant, { status: 201 });
}
