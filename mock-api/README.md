# Mock Coframe API

A local server that simulates the Coframe variant approval API.

## Setup

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Test credentials

| | |
|---|---|
| Token | `tok_demo_clnt_123` |
| Project ID | `proj_clnt_website` |

---

## Endpoints

### `GET /api/variants`

Returns variants pending client approval, grouped by experiment.

**Query params**

| Param | Required | Description |
|---|---|---|
| `token` | yes | API token |
| `projectId` | yes | Project identifier |
| `status` | no | Pass `all` to include every status, not just `ready_for_review` |

```bash
curl "http://localhost:3000/api/variants?token=tok_demo_clnt_123&projectId=proj_clnt_website"
```

**Response**

```json
{
  "projectId": "proj_clnt_website",
  "customerSlug": "CLNT",
  "totalPendingApproval": 6,
  "experiments": [
    {
      "id": "exp_homepage_hero",
      "name": "Homepage Hero",
      "variants": [
        {
          "id": "CLNT-001",
          "slug": "hero-cta-free-trial",
          "status": "ready_for_review",
          "idea": "Lower friction by switching the primary CTA from a passive 'Learn more' to an action-oriented free trial offer.",
          "copyChanges": [
            {
              "selector": "hero .cta-primary",
              "original": "Learn more",
              "variant": "Start your free trial"
            }
          ],
          "previewUrl": "https://www.acmecorp.com/?variant_id=CLNT-001&slug=hero-cta-free-trial",
          "updatedAt": "2025-05-28T09:00:00Z"
        }
      ]
    }
  ]
}
```

---

### `PATCH /api/variants/:id/status`

Updates a variant's approval status.

**Auth:** `Authorization: Bearer <token>` header required.

**Body**
```json
{ "status": "approved" }
```

Valid values: `ready_for_review` · `approved` · `launched` · `cancelled` · `need_fixes`

```bash
curl -X PATCH http://localhost:3000/api/variants/CLNT-001/status \
  -H "Authorization: Bearer tok_demo_clnt_123" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

**Response:** the updated variant object.

---

## Running tests

Run the integration test suite against a freshly started server:

```bash
npm test
# or against a different port:
BASE=http://localhost:4000 bash test.sh
```

> State resets on server restart — always start fresh before running tests.
