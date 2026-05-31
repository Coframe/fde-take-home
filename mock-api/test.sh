#!/usr/bin/env bash
# Integration tests for the mock Coframe API.
# Run against a freshly started server: npm run dev
#
# Usage:
#   bash test.sh                      # default: http://localhost:3000
#   BASE=http://localhost:4000 bash test.sh

set -euo pipefail

BASE="${BASE:-http://localhost:3000}"
TOKEN="tok_demo_clnt_123"
PROJECT="proj_clnt_website"
PASS=0
FAIL=0

# ── helpers ──────────────────────────────────────────────────────────────────

ok() {
  echo "  ✓ $1"
  PASS=$((PASS+1))
}

fail() {
  echo "  ✗ $1"
  echo "    expected: $2"
  echo "    got:      $3"
  FAIL=$((FAIL+1))
}

check_status() {
  local desc="$1" expected="$2" actual="$3"
  [ "$actual" = "$expected" ] && ok "$desc" || fail "$desc" "$expected" "$actual"
}

check_contains() {
  local desc="$1" needle="$2" haystack="$3"
  echo "$haystack" | grep -Fq "$needle" && ok "$desc" || fail "$desc" "contains '$needle'" "not found"
}

json_field() {
  # json_field <json> <field>  — naive grep-based extraction for portability
  echo "$1" | grep -o "\"$2\":[^,}]*" | head -1 | sed "s/\"$2\"://" | tr -d ' "'
}

requires_server() {
  if ! curl -sf "$BASE/api/variants?token=$TOKEN&projectId=$PROJECT" > /dev/null 2>&1; then
    echo ""
    echo "  ERROR: Cannot reach $BASE — is 'npm run dev' running?"
    echo ""
    exit 1
  fi
}

# ── pre-flight ────────────────────────────────────────────────────────────────

echo ""
echo "Mock Coframe API — Integration Tests"
echo "Server: $BASE"
echo "NOTE: Run against a fresh server (state resets on restart)"
echo "========================================================"
echo ""

requires_server

# ── 1. GET /api/variants ─────────────────────────────────────────────────────

echo "1. GET /api/variants"
echo "--------------------"

# 1a. Happy path — 6 variants pending on fresh server
RESP=$(curl -sf "$BASE/api/variants?token=$TOKEN&projectId=$PROJECT")
COUNT=$(echo "$RESP" | grep -o '"id":"CLNT-' | wc -l | tr -d ' ')
check_status "returns 6 pending variants" "6" "$COUNT"

# 1b. Correct customer slug
SLUG=$(json_field "$RESP" "customerSlug")
check_status "customerSlug is CLNT" "CLNT" "$SLUG"

# 1c. Response contains totalPendingApproval=6
TOTAL=$(json_field "$RESP" "totalPendingApproval")
check_status "totalPendingApproval is 6" "6" "$TOTAL"

# 1d. Three experiments in response
EXP_COUNT=$(echo "$RESP" | grep -o '"experimentId"' | wc -l | tr -d ' ')
check_status "6 variants spread across experiments" "6" "$EXP_COUNT"

# 1e. Missing token → 400
HTTP=$(curl -so /dev/null -w "%{http_code}" "$BASE/api/variants?projectId=$PROJECT")
check_status "missing token → 400" "400" "$HTTP"

# 1f. Missing projectId → 400
HTTP=$(curl -so /dev/null -w "%{http_code}" "$BASE/api/variants?token=$TOKEN")
check_status "missing projectId → 400" "400" "$HTTP"

# 1g. Wrong token → 0 variants
RESP2=$(curl -sf "$BASE/api/variants?token=bad_token&projectId=$PROJECT")
TOTAL2=$(json_field "$RESP2" "totalPendingApproval")
check_status "wrong token → 0 pending" "0" "$TOTAL2"

# 1h. ?status=all returns all variants (same 6 on fresh server)
RESP3=$(curl -sf "$BASE/api/variants?token=$TOKEN&projectId=$PROJECT&status=all")
COUNT3=$(echo "$RESP3" | grep -o '"id":"CLNT-' | wc -l | tr -d ' ')
check_status "?status=all returns 6 on fresh server" "6" "$COUNT3"

echo ""

# ── 2. PATCH /api/variants/:id/status ────────────────────────────────────────

echo "2. PATCH /api/variants/:id/status"
echo "----------------------------------"

# 2a. Approve CLNT-001
HTTP=$(curl -so /dev/null -w "%{http_code}" -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}' \
  "$BASE/api/variants/CLNT-001/status")
check_status "approve CLNT-001 → 200" "200" "$HTTP"

# 2b. Response body contains updated status
RESP=$(curl -sf -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"cancelled"}' \
  "$BASE/api/variants/CLNT-002/status")
STATUS_VAL=$(json_field "$RESP" "status")
check_status "cancel CLNT-002 returns updated status in body" "cancelled" "$STATUS_VAL"

# 2c. After 2 mutations, only 4 remain pending
RESP=$(curl -sf "$BASE/api/variants?token=$TOKEN&projectId=$PROJECT")
TOTAL=$(json_field "$RESP" "totalPendingApproval")
check_status "after 2 mutations, 4 variants remain pending" "4" "$TOTAL"

# 2d. ?status=all still returns all 6
RESP=$(curl -sf "$BASE/api/variants?token=$TOKEN&projectId=$PROJECT&status=all")
COUNT=$(echo "$RESP" | grep -o '"id":"CLNT-' | wc -l | tr -d ' ')
check_status "?status=all still shows all 6 variants" "6" "$COUNT"

# 2e. Missing Authorization → 401
HTTP=$(curl -so /dev/null -w "%{http_code}" -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}' \
  "$BASE/api/variants/CLNT-003/status")
check_status "missing auth header → 401" "401" "$HTTP"

# 2f. Wrong token in auth → 404
HTTP=$(curl -so /dev/null -w "%{http_code}" -X PATCH \
  -H "Authorization: Bearer wrong_token" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}' \
  "$BASE/api/variants/CLNT-003/status")
check_status "wrong token in auth → 404" "404" "$HTTP"

# 2g. Invalid status value → 400
HTTP=$(curl -so /dev/null -w "%{http_code}" -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"something_made_up"}' \
  "$BASE/api/variants/CLNT-003/status")
check_status "invalid status value → 400" "400" "$HTTP"

# 2h. Missing body → 400
HTTP=$(curl -so /dev/null -w "%{http_code}" -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE/api/variants/CLNT-003/status")
check_status "empty body → 400" "400" "$HTTP"

# 2i. Nonexistent variant → 404
HTTP=$(curl -so /dev/null -w "%{http_code}" -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}' \
  "$BASE/api/variants/CLNT-999/status")
check_status "nonexistent variant → 404" "404" "$HTTP"

echo ""

# ── 3. Comments (undocumented) ────────────────────────────────────────────────

echo "3. /api/variants/:id/comments  (undocumented)"
echo "----------------------------------------------"

# 3a. GET comments on fresh variant — empty array
RESP=$(curl -sf "$BASE/api/variants/CLNT-003/comments")
check_contains "fresh variant has empty comments array" '"comments":[]' "$RESP"

# 3b. POST a comment → 201
HTTP=$(curl -so /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"LGTM from legal","author":"alice@legal.com"}' \
  "$BASE/api/variants/CLNT-003/comments")
check_status "post comment → 201" "201" "$HTTP"

# 3c. POST a second comment
curl -sf -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"Design also approves","author":"bob@design.com"}' \
  "$BASE/api/variants/CLNT-003/comments" > /dev/null

# 3d. GET comments — now 2
RESP=$(curl -sf "$BASE/api/variants/CLNT-003/comments")
COUNT=$(echo "$RESP" | grep -o '"id":"cmt_' | wc -l | tr -d ' ')
check_status "GET returns 2 comments after 2 posts" "2" "$COUNT"

# 3e. Comment body contains author and text
check_contains "comment contains author" "alice@legal.com" "$RESP"
check_contains "comment contains text" "LGTM from legal" "$RESP"

# 3f. POST comment — missing author → 400
HTTP=$(curl -so /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"missing author field"}' \
  "$BASE/api/variants/CLNT-003/comments")
check_status "comment missing author → 400" "400" "$HTTP"

# 3g. POST comment — missing text → 400
HTTP=$(curl -so /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"author":"someone@co.com"}' \
  "$BASE/api/variants/CLNT-003/comments")
check_status "comment missing text → 400" "400" "$HTTP"

# 3h. Comments on nonexistent variant → 404
HTTP=$(curl -so /dev/null -w "%{http_code}" "$BASE/api/variants/CLNT-999/comments")
check_status "comments for nonexistent variant → 404" "404" "$HTTP"

# 3i. POST comment to nonexistent variant → 404
HTTP=$(curl -so /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"hello","author":"x@y.com"}' \
  "$BASE/api/variants/CLNT-999/comments")
check_status "post comment to nonexistent variant → 404" "404" "$HTTP"

echo ""

# ── 4. POST /api/variants (create random draft) ───────────────────────────────

echo "4. POST /api/variants  (create random draft)"
echo "---------------------------------------------"

# 4a. Create a new variant → 201
HTTP=$(curl -so /dev/null -w "%{http_code}" -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE/api/variants")
check_status "create random variant → 201" "201" "$HTTP"

# 4b. Response contains new ID (CLNT-007)
RESP=$(curl -sf -X POST -H "Authorization: Bearer $TOKEN" "$BASE/api/variants")
check_contains "new variant has CLNT- prefixed ID" "CLNT-" "$RESP"

# 4c. New variant starts as draft (not visible in default pending list)
check_contains "new variant status is draft" '"status":"draft"' "$RESP"

# 4d. Draft does NOT appear in the default pending response
BEFORE=$(curl -sf "$BASE/api/variants?token=$TOKEN&projectId=$PROJECT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['totalPendingApproval'])" 2>/dev/null || echo '?')
curl -sf -X POST -H "Authorization: Bearer $TOKEN" "$BASE/api/variants" > /dev/null
AFTER=$(curl -sf "$BASE/api/variants?token=$TOKEN&projectId=$PROJECT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['totalPendingApproval'])" 2>/dev/null || echo '?')
check_status "draft variant does not appear in pending count" "$BEFORE" "$AFTER"

# 4e-2. Draft IS visible via ?status=all
RESP_ALL=$(curl -sf "$BASE/api/variants?token=$TOKEN&projectId=$PROJECT&status=all")
check_contains "draft visible via ?status=all" '"status":"draft"' "$RESP_ALL"

# 4e. Missing auth → 401
HTTP=$(curl -so /dev/null -w "%{http_code}" -X POST "$BASE/api/variants")
check_status "create without auth → 401" "401" "$HTTP"

echo ""

# ── 5. DELETE /api/variants/:id ───────────────────────────────────────────────

echo "5. DELETE /api/variants/:id"
echo "---------------------------"

# 5a. Delete CLNT-006 → 204
HTTP=$(curl -so /dev/null -w "%{http_code}" -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE/api/variants/CLNT-006")
check_status "delete CLNT-006 → 204" "204" "$HTTP"

# 5b. Deleted variant no longer appears in ?status=all
RESP=$(curl -sf "$BASE/api/variants?token=$TOKEN&projectId=$PROJECT&status=all")
FOUND=$(echo "$RESP" | grep -Fc '"id":"CLNT-006"' || true)
check_status "CLNT-006 absent from ?status=all after delete" "0" "$FOUND"

# 5c. Missing auth → 401
HTTP=$(curl -so /dev/null -w "%{http_code}" -X DELETE \
  "$BASE/api/variants/CLNT-005")
check_status "delete without auth → 401" "401" "$HTTP"

# 5d. Wrong token → 404
HTTP=$(curl -so /dev/null -w "%{http_code}" -X DELETE \
  -H "Authorization: Bearer wrong_token" \
  "$BASE/api/variants/CLNT-005")
check_status "delete with wrong token → 404" "404" "$HTTP"

# 5e. Nonexistent variant → 404
HTTP=$(curl -so /dev/null -w "%{http_code}" -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE/api/variants/CLNT-999")
check_status "delete nonexistent variant → 404" "404" "$HTTP"

# 5f. Deleting already-deleted variant → 404
HTTP=$(curl -so /dev/null -w "%{http_code}" -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE/api/variants/CLNT-006")
check_status "re-delete already-deleted variant → 404" "404" "$HTTP"

echo ""

# ── summary ───────────────────────────────────────────────────────────────────

echo "========================================================"
echo "Results: ${PASS} passed  |  ${FAIL} failed"
echo ""

[ "$FAIL" -eq 0 ] && exit 0 || exit 1
