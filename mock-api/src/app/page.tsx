'use client';

import { useEffect, useState, useCallback } from 'react';

const TOKEN = 'tok_demo_clnt_123';
const PROJECT_ID = 'proj_clnt_website';

type Status = 'ready_for_review' | 'approved' | 'launched' | 'cancelled' | 'need_fixes';

interface CopyChange { selector: string; original: string; variant: string; }
interface Variant {
  id: string;
  slug: string;
  experimentId: string;
  status: Status;
  idea: string;
  copyChanges: CopyChange[];
  previewUrl: string;
  updatedAt: string;
}
interface Experiment { id: string; name: string; variants: Variant[]; }
interface ApiResponse {
  projectId: string;
  customerSlug: string;
  total: number;
  experiments: Experiment[];
}

const STATUS_LABEL: Record<Status, string> = {
  ready_for_review: 'Ready for Review',
  approved: 'Approved',
  launched: 'Launched',
  cancelled: 'Cancelled',
  need_fixes: 'Need Fixes',
};
const STATUS_CLASS: Record<Status, string> = {
  ready_for_review: 'badge-needs',
  approved: 'badge-approved',
  launched: 'badge-launched',
  cancelled: 'badge-wont',
  need_fixes: 'badge-draft',
};

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingStatus, setPendingStatus] = useState<Record<string, Status>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  const fetchAll = useCallback(() => {
    setLoading(true);
    fetch(`/api/variants?token=${TOKEN}&projectId=${PROJECT_ID}&status=all`)
      .then(r => r.json())
      .then((d: ApiResponse) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateStatus = async (variantId: string) => {
    const status = pendingStatus[variantId];
    if (!status) return;
    setUpdating(u => ({ ...u, [variantId]: true }));
    await fetch(`/api/variants/${variantId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify({ status }),
    });
    setUpdating(u => ({ ...u, [variantId]: false }));
    setPendingStatus(p => { const n = { ...p }; delete n[variantId]; return n; });
    fetchAll();
  };

  if (loading && !data) return <p style={{ padding: 32 }}>Loading…</p>;
  if (!data) return <p style={{ padding: 32 }}>Error — is the server running?</p>;

  const reviewCount = data.experiments.flatMap(e => e.variants).filter(v => v.status === 'ready_for_review').length;

  return (
    <>
      <header>
        <h1>Coframe Mock API</h1>
        <p>
          Project: <code>{PROJECT_ID}</code> &nbsp;·&nbsp; Customer:{' '}
          <strong>{data.customerSlug}</strong> &nbsp;·&nbsp;{' '}
          {reviewCount} ready for review
        </p>
      </header>

      <div className="refresh-bar">
        <span>{data.total} variants across {data.experiments.length} experiments</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={async () => {
            await fetch('/api/variants', {
              method: 'POST',
              headers: { Authorization: `Bearer ${TOKEN}` },
            });
            fetchAll();
          }}>+ New draft variant</button>
          <button className="btn" onClick={fetchAll}>↺ Refresh</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Variant</th>
            <th>Idea</th>
            <th>Copy change</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {data.experiments.flatMap(exp => [
            <tr key={`hdr-${exp.id}`} className="exp-group">
              <td colSpan={5}>{exp.name}</td>
            </tr>,
            ...exp.variants.map(v => (
              <tr key={v.id}>
                <td>
                  <code>{v.id}</code>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{v.slug}</div>
                </td>
                <td><div className="idea-text">{v.idea}</div></td>
                <td>
                  {v.copyChanges.map((c, i) => (
                    <div key={i} className="copy-diff">
                      <del>{c.original}</del>
                      <ins>{c.variant}</ins>
                    </div>
                  ))}
                </td>
                <td>
                  <span className={`badge ${STATUS_CLASS[v.status]}`}>
                    {STATUS_LABEL[v.status]}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <select
                      value={pendingStatus[v.id] ?? v.status}
                      onChange={e =>
                        setPendingStatus(p => ({ ...p, [v.id]: e.target.value as Status }))
                      }
                    >
                      <option value="ready_for_review">Ready for Review</option>
                      <option value="approved">Approved</option>
                      <option value="launched">Launched</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="need_fixes">Need Fixes</option>
                    </select>
                    <button
                      className="btn"
                      disabled={!pendingStatus[v.id] || updating[v.id]}
                      onClick={() => updateStatus(v.id)}
                    >
                      {updating[v.id] ? '…' : 'Save'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={async () => {
                        await fetch(`/api/variants/${v.id}`, {
                          method: 'DELETE',
                          headers: { Authorization: `Bearer ${TOKEN}` },
                        });
                        fetchAll();
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            )),
          ])}
        </tbody>
      </table>
    </>
  );
}
