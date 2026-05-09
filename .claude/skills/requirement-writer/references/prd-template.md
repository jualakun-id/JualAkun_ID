# PRD Template

## Template structure

```markdown
# PRD — {PROJECT_TITLE}

> Version: V0.1
> Date: {DATE}
> Author: {AUTHOR}
> Status: Draft / In Review / Approved

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| V0.1 | {DATE} | {AUTHOR} | Initial draft |

---

## 1. Background

{1-2 paragraphs of business context. Why is this being built now?
What is the strategic rationale? Reference the Problem Framing or SRD if available.}

## 2. Overview

| Field | Value |
|-------|-------|
| Platform(s) | {Web / Mobile / Both} |
| Primary Language | {Indonesian / English / Both} |
| Target Release | {Quarter or date} |
| PM Owner | {Name} |
| Design Owner | {Name} |
| Tech Lead | {Name} |

## 3. Goals & Non-Goals

### Goals
- {Specific, measurable outcome 1}
- {Specific, measurable outcome 2}

### Non-Goals (explicitly out of scope)
- {What we are NOT doing in this version}

## 4. User Segments

{Only include if the project handles multiple user types with different experiences.}

| Segment | Description | Key Need |
|---------|-------------|---------|
| {Segment 1} | {Who they are} | {What they need} |
| {Segment 2} | {Who they are} | {What they need} |

## 5. User Flows

{Only include for cross-page or multi-step flows. Use numbered steps or diagrams.}

### Flow: {Flow Name}
1. User lands on {page}
2. User does {action}
3. System responds with {result}
4. ...

## 6. Product Requirements

### 6.1 Frontend Requirements

{Describe UI behavior, component states, interactions.
Be specific: "button disables when cart is empty" not "button works correctly"}

#### {Feature/Page 1}
- {Requirement 1}
- {Requirement 2}

#### {Feature/Page 2}
- {Requirement 1}

### 6.2 Backend / Business Logic Requirements

> Note: PM describes WHAT (business need). Dev lead adds HOW (technical implementation).

#### {Feature 1}
- **Business rule**: {Rule description}
- **Edge cases**: {List edge cases}
- **Data source**: {Where does the data come from?}

#### {Feature 2}
- **Business rule**: {Rule description}

### 6.3 Acceptance Criteria

{Testable, specific conditions. QA can independently verify each one.}

| Feature | Acceptance Criteria |
|---------|-------------------|
| {Feature 1} | [ ] {Specific testable condition} |
| | [ ] {Another testable condition} |
| {Feature 2} | [ ] {Specific testable condition} |

## 7. Data Requirements

### 7.1 Analytics Events

| Event Name | Trigger | Properties |
|-----------|---------|-----------|
| {event_name} | {When it fires} | {Key properties to track} |

### 7.2 A/B Testing

{Reference the plan from SRD §8.2 or mark as TBD.}

## 8. Non-Functional Requirements

### 8.1 Performance
- Page load target: {e.g., < 2s on 4G}
- API response target: {e.g., < 500ms p95}

### 8.2 Security
- {Authentication requirements}
- {Authorization rules}
- {Data sensitivity handling}

### 8.3 Accessibility
- {WCAG level target, e.g., AA}
- {Specific accessibility requirements}

### 8.4 SEO
{Only include for public-facing pages.}
- {Meta tag requirements}
- {URL structure}
- {Structured data}

## 9. Dependencies

| Dependency | Type | Owner | Status |
|-----------|------|-------|--------|
| {API / Service} | External / Internal | {Team} | {Ready / In Progress / Blocked} |

## 10. Launch Strategy

### 10.1 Rollout Plan
{Gradual rollout? Feature flag? Full launch? Reference A/B test if applicable.}

### 10.2 Rollback Plan
{What triggers a rollback? How quickly can it be reverted?}

### 10.3 Launch Checklist
- [ ] Feature flag configured
- [ ] Analytics events verified in staging
- [ ] Load testing completed
- [ ] Support team briefed
- [ ] Monitoring dashboards set up

## 11. Responsibility Matrix

| Section | PM (Write) | Design (Review) | Dev (Review) | Stakeholders (Inform) |
|---------|-----------|----------------|-------------|----------------------|
| Background | R | C | C | I |
| Product Requirements | R | C | C | I |
| Backend Logic (business) | R | - | C | I |
| Backend Logic (technical) | I | - | R | - |
| Acceptance Criteria | R | C | R | - |
| Launch Strategy | R | C | C | I |

R = Author/Responsible, C = Consulted/Reviewer, I = Informed
```

## Section guidelines

**§6.1 Frontend:** Describe states (empty, loading, error, success) for each component.
Avoid "works correctly" — say what "correct" means.

**§6.2 Backend:** PM owns the business rules; do not write implementation details.
Mark technical sections with a [DEV] tag for the developer to fill in.

**§6.3 Acceptance Criteria:** Each criterion must be independently verifiable by QA
without asking the PM for clarification.

**§8 Non-functional:** Performance and security sections are required.
SEO only for public-facing pages. Accessibility required for user-facing features.

**§10 Launch Strategy:** Always define a rollback plan, even if it's simple.
