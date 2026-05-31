# Coframe Forward Deploy — Take-Home

## Background

You have 2 hours before a client call.

Every variant that Coframe generates goes through a sign-off chain before it can ship — Product, Brand, Design, Legal. Right now the whole process lives in a Google Sheet managed by Sarah, the client's main point of contact. Onboarding the full team into Coframe isn't moving fast enough, so the sheet isn't going away yet.

**The ask:** before the call, build an integration between Sarah's sheet and the Coframe API so approvals flow automatically — no manual status updates required.

---

## What you have

### 1. Mock Coframe API

A local server that simulates the Coframe variant approval API.

```bash
cd mock-api
npm install
npm run dev
# → http://localhost:3000
```

See [mock-api/README.md](mock-api/README.md) for the full API reference.

---

### 2. Spreadsheet template

[→ Open Variant Approval Tracker](https://docs.google.com/spreadsheets/d/1KQBYVktMoKUdVCKQgEAJzB26nCfcC0ts55WwG8cIi3M/edit)

Make a copy. This is the sheet Sarah uses to coordinate approvals today. Each team (Product, Brand, Design, Legal) marks their column **Yes**, **No**, or **Skip**. Column K computes the overall decision automatically.

---

## Your task

Close the loop — without Sarah.

When all four teams have signed off in the sheet, the variant's status in Coframe should update automatically. You choose how: a script, a trigger, a server, a cron job — whatever gets it working.

> The mock API resets state on server restart. Keep that in mind when designing your solution.

You have 2 hours. The output is a working demo you walk us through on the call.

---

## Verifying the mock API

```bash
cd mock-api && npm test
```
