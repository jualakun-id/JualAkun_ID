# SRD Template

## Template structure

```markdown
# SRD — {PROJECT_TITLE}

> Version: V0.1
> Date: {DATE}
> Author: {AUTHOR}

---

## 1. Customer

{Target customers: internal/external, user segments, audience definition}

## 2. Job to be Done

{Core task the customer needs to accomplish. 1-3 sentences.}

## 3. Benefit

### 3.1 Customer Value

{Specific, tangible value to users}

### 3.2 Business Value

{Business value with quantifiable metrics where possible}

### 3.3 Brand Impact

{Brand perception impact. Mark as TBD if not applicable.}

## 4. Problem

{Detailed description of current issues, challenges, and pain points.
Can include multiple dimensions. Reference data if available.}

## 5. Solution

### 5.1 Benchmark Analysis

{How competitors or industry benchmarks handle similar problems}

### 5.2 Before/After Comparison

{Expected changes after launch — describe the current state vs. target state}

### 5.3 Scope (In / Out)

| In Scope | Out of Scope |
|----------|-------------|
| ... | ... |

### 5.4 Phasing (if applicable)

{Only include for large/multi-phase projects.}

| Phase | Scope | Goal | Dependencies |
|-------|-------|------|-------------|
| Phase 1 | ... | ... | ... |
| Phase 2 | ... | ... | Phase 1 |

## 6. Success Metrics

| Metric Type | Metric Name | Target |
|------------|-------------|--------|
| Core Metric | ... | ... |
| Observation Metric | ... | ... |

## 7. Risks & Mitigation

| Risk Type | Risk Description | Mitigation |
|-----------|-----------------|------------|
| Technical Risk | ... | ... |
| Business Risk | ... | ... |
| Timeline Risk | ... | ... |

## 8. Feedback Loops

### 8.1 Stakeholders Feedback

- **Key Stakeholders** — {who}
- **Feedback tracking** — {how}
- **Feedback prioritization** — {criteria}

### 8.2 A/B Testing

{Hypothesis, group design, trigger conditions, metrics.
Mark as TBD if not planned yet.}

### 8.3 Before/After Data

{Post-launch data comparison plan}

## 9. Product Requirements

{Summary-level product requirements. Detailed spec lives in the PRD.}

## 10. UI/UX Requirements

{Summary-level design requirements. Detailed spec lives in the PRD.}
```

## Relationship to Problem Framing

If a Problem Framing already exists, reuse its content directly:

| SRD section | Maps from Problem Framing field |
|------------|-------------------------------|
| 1. Customer | WHO |
| 2. Job to be Done | WHAT Job |
| 3.1 Customer Value | WHAT benefits for the customer |
| 3.2 Business Value | WHAT benefits for the company |
| 4. Problem | WHAT Problem + WHEN |

Sections 5-10 are SRD-only and require additional information gathering.

## Section guidelines

**§5.3 Scope:** This section prevents scope creep. Always fill it —
even "Out of Scope: TBD, to be discussed in review" is better than omitting it.

**§6 Success Metrics:** At minimum, define the direction even without
exact targets. "Improve homepage conversion rate" is better than nothing,
though "Improve homepage conversion rate from 2.1% to 2.8%" is ideal.

**§7 Risks:** Focus on risks that could derail the project or require
plan changes. Skip trivial risks.

**§5.4 Phasing:** Only include for projects that clearly need multiple releases.
Do not force phasing on small, single-delivery projects.
