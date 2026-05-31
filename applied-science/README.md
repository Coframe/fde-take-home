# Coframe Applied Science — Take-Home

## Background

Coframe runs copy experiments on client websites. Before a client signs, the sales team needs to answer a simple question: *what can they actually expect from an experimentation program — in dollars, in time, in number of tests?*

Right now that answer lives in someone's head. The goal is to make it a tool.

---

## Your task

Build an **Experimentation ROI Simulator** — a tool that takes inputs about a client's website and produces a 12-month outlook for what a structured experimentation program could achieve.

Numbers alone are not enough. The output must be human-readable — a sales rep should be able to walk a client through it without needing to explain statistics. Something like: *"With your traffic, each test takes about 18 days to reach significance. Running tests continuously at a 20% win rate, you could expect 3–4 winners in your first quarter."*

**Deterministic or non-deterministic — your call.** The math core (power analysis, expected lift, revenue model) must be grounded in statistics. You are welcome to wrap that in an LLM to generate the human-friendly narrative, or keep it purely algorithmic. Either way, the numbers must be defensible.

See [examples.md](examples.md) for sample client inputs you can use to develop and demo your tool.

---

## Inputs

| Input | Description | Example |
|---|---|---|
| Page name | Label for the page | `"Pricing"` |
| Daily active users | Traffic to that page per day | `1 200` |
| Baseline conversion rate | Current rate for the target metric | `2.1%` |
| Revenue per conversion | Average value of one conversion | `$89` |
| Target lift | The improvement being aimed for | `10%` |
| Win rate | % of experiment ideas that beat the baseline by the target lift | `20%` |
| Statistical significance threshold | Confidence level to call a winner | `95%` |
| Statistical power | Desired test sensitivity | `80%` |

Multiple pages can be added. Each is modelled independently.

---

## Outputs

### Per page
- Estimated days to reach significance for one test
- Expected tests per month (continuous testing assumed)
- Expected winners per month given the win rate
- Expected monthly and cumulative 12-month revenue lift

### Program level
- Total expected annual revenue lift across all pages
- Total tests needed across the program
- Plain-language summary of what the client can realistically expect in year one

### Visualization — at least one of
- Cumulative revenue lift over 12 months
- Per-page breakdown of expected impact
- Sensitivity table: how the 12-month outcome shifts when win rate or target lift changes

---

## Assumptions to expose

Candidates should make these explicit in the tool and may add more:

- Number of variants per experiment (default: 1 challenger vs. control)
- Tests run sequentially per page, not simultaneously
- Once a variant wins it becomes the new baseline for the next test
- No seasonality modelling (note it as a limitation if relevant)

---

## Output format — open-ended

Pick whatever you can build and demo well in 2 hours:

- Streamlit or Gradio app
- Jupyter notebook with interactive widgets
- Next.js / React web app
- CLI tool with a formatted report
- Observable notebook

The requirement is that a non-technical sales rep can run it and walk a client through the output.

---

## Deliverables

Submit a **recorded video** and your **code** (repo link, gist, or zip).

The video should cover:

1. **Demo** — run the tool with at least one of the example clients; show how the output changes when assumptions shift
2. **Solution** — what you built, how, and why; include every AI tool you used during the build
3. **Edge cases** — what you handled, what you consciously left out, and why (a sales-stage tool has different requirements than a production analytics platform — explain your scoping decisions)
4. **Productionization** — how would this scale to serve all Coframe sales reps across all clients?
