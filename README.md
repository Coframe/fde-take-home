# Coframe Forward Deploy — Take-Home

## Background

We have a call with client in 2 hours.

Every variant that gets generated and QAed has to go through a sign-off chain before it can be shiped — Product, Brand, Design, Legal.
Currently the whole process lives in a Google Sheet, managed by Sarah, our PoC and advocate at company. Onboarding 15 people to coframe isn't happening fast enough to make Approval procees through Coframe, so we want to keep running spreadheet.

**The ask:** before this call, build an Coframe demo integration to Sarah's sheet, so we can at least demo/get feedback there.

---

## What you have

### 1. Mock Coframe API

A local server that simulates the Coframe variant approval API. Run it and leave it running.

```bash
cd mock-api
npm install
npm run dev
# → http://localhost:3000
```

**Test credentials**

| | |
|---|---|
| Token | `tok_demo_clnt_123` |
| Project ID | `proj_clnt_website` |

---

### API reference

#### `GET /api/variants`

Returns all variants currently pending client approval, grouped by experiment.

**Query params**

| Param | Required | Description |
|---|---|---|
| `token` | yes | User API token |
| `projectId` | yes | Project identifier |

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

#### `PATCH /api/variants/:id/status`

Updates a variant's approval status in Coframe.

**Auth:** `Authorization: Bearer <token>` header required.

**Body**
```json
{ "status": "approved" }
```

Valid values: `ready_for_review`, `approved`, `launched`, `cancelled`, `need_fixes`

```bash
curl -X PATCH http://localhost:3000/api/variants/CLNT-001/status \
  -H "Authorization: Bearer tok_demo_clnt_123" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

**Response:** the updated variant object.

---

### 2. Spreadsheet template

[→ Open Variant Approval Tracker template](https://docs.google.com/spreadsheets/d/1KQBYVktMoKUdVCKQgEAJzB26nCfcC0ts55WwG8cIi3M/edit)

Make a copy. This is the sheet Sarah uses to coordinate approvals today. Each team (Product, Brand, Design, Legal) marks their column **Yes**, **No**, or **Skip**. Column K computes the overall status automatically.

---

## Your task

Make the loop work — without Sarah.

The mock API resets state on server restart — keep that in mind when designing.

You have 2 hours. The output is a working demo you walk us through on the call.

---

## Verifying the mock API

```bash
cd mock-api
npm run test   # runs test.sh against http://localhost:3000
```

Or point it at a different port:
```bash
BASE=http://localhost:4000 bash mock-api/test.sh
```
