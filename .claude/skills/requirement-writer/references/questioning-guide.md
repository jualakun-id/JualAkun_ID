# Questioning Guide

## Contents

- Questioning philosophy
- Layer 1: Problem essence
- Layer 2: Solution direction
- Layer 3: Success definition
- Adaptive behavior
- Completeness scoring
  - Problem Framing scoring
  - SRD additional scoring
  - PRD additional scoring

---

## Questioning philosophy

Extract information from natural conversation rather than interrogating
field by field. The user describes their project; you identify what's
covered and what's missing, then ask only about the gaps.

One open question often fills multiple fields. For example, "Tell me
about the project background" might reveal WHO, WHAT Problem, and WHEN
in a single answer.

---

## Layer 1: Problem essence

Goal: understand the core problem and who it affects.

Start with an open question like:
> "Ceritakan latar belakang proyek/fitur ini. Masalah apa yang ingin diselesaikan?"

From the answer, extract signals for:
- **WHO**: target users, segments, personas
- **WHAT Problem**: pain points, current issues, status quo
- **WHEN**: scenario, trigger, touchpoint where the problem occurs
- **Current workaround**: how users cope today (enriches Problem description)

Follow-up only on what's unclear. Examples:
- WHO unclear: "Pengguna yang kamu maksud, apakah pembeli, penjual, atau keduanya? Ada segmen lebih spesifik?"
- Problem vague: "Bisa kasih contoh konkretnya? User stuck di mana?"
- WHEN missing: "Masalah ini muncul di kondisi/langkah apa?"

---

## Layer 2: Solution direction

Goal: understand what the user wants to build and the boundaries.

Transition naturally:
> "Oke, paham masalahnya. Sekarang, solusi seperti apa yang kalian bayangkan? Ada ide awal?"

From the answer, extract signals for:
- **WHAT Job**: the core task users need to accomplish (JTBD)
- **Solution outline**: high-level approach
- **Scope**: what's in, what's out for this version
- **Benchmark**: any competitive or industry references
- **Before/After**: expected change after launch
- **Project type signals**: single page? cross-page flow? multiple user segments? phased rollout?

Follow-up examples:
- Job unclear: "Apa yang ingin user capai pada akhirnya?"
- Scope undefined: "Versi ini fokus ke fitur apa saja? Ada yang sengaja tidak dimasukkan dulu?"
- No benchmark: "Ada referensi platform lain yang pendekatannya menarik?"

---

## Layer 3: Success definition

Goal: understand how to measure success and validate the solution.

Transition:
> "Terakhir, bagaimana kita tahu ini berhasil? Metrik atau indikator apa yang kamu pantau?"

From the answer, extract signals for:
- **Customer benefit**: value to users
- **Business benefit**: value to company, ideally quantifiable
- **Brand impact**: brand perception change (optional)
- **Success metrics**: primary + observation metrics
- **A/B testing**: hypothesis, groups, trigger conditions
- **Stakeholders**: who needs to be aligned

Follow-up examples:
- Benefits vague: "Buat user, improvement paling terasa di mana? Buat bisnis?"
- No metrics: "Kalau mau buktikan fitur ini sukses lewat data, kamu lihat angka apa?"
- A/B unclear: "Perlu A/B testing? Gimana pembagian grup kontrolnya?"

---

## Adaptive behavior

Adjust based on how much information the user provides:

**User gives detailed context in one message:**
Skip most questions. Summarize what you extracted, highlight any gaps,
and ask about gaps only.

**User gives minimal context:**
Go through all three layers. But keep each round to 1-2 questions max.

**User is unsure about something:**
Offer concrete options to help them decide. Example:
> "Metrik sukses biasanya bisa dilihat dari conversion rate, GMV, atau retention. Yang paling relevan buat proyek ini mana?"

**User wants to skip a section:**
Allow it. Mark as TBD in the document. Don't block progress.

---

## Completeness scoring

Before generating a document, score each required field.

### Problem Framing scoring

| Field | Green - Sufficient | Yellow - Thin | Red - Missing |
|-------|-------------|--------|-----------|
| WHO | Can answer "who" AND "why this group specifically" | Can answer "who" but not "why this group" | Cannot identify target users |
| WHAT Problem | Specific pain points with concrete examples or data | Has a problem direction but too abstract | No problem articulated |
| WHEN | Clear scenario/touchpoint/trigger | Vague context | No scenario described |
| WHAT Job | Clear task the user is trying to accomplish | Task implied but not explicit | No task defined |
| Customer Benefit | Specific, tangible user value | Directional but generic ("better experience") | Not mentioned |
| Company Benefit | Quantifiable or clearly measurable business value | Has direction but no metric ("increase revenue") | Not mentioned |

Rules:
- All Green → generate
- Any Yellow → inform user, ask if they want to supplement or proceed as-is
- Any Red → ask follow-up for red fields, do not generate until resolved

### SRD additional scoring

All Problem Framing fields plus:

| Field | Green - Sufficient | Yellow - Thin | Red - Missing |
|-------|-------------|--------|-----------|
| Solution / Scope | Clear approach with defined boundaries | Has approach but no scope boundaries | No solution direction |
| Success Metrics | Primary metric + at least 1 observation metric | Only directional ("improve conversion") | No metrics |
| Risks | At least 1 identified risk with mitigation | Risks acknowledged but no mitigation | Not considered |

Optional fields (Brand Impact, Benchmark, A/B Testing, Stakeholders, Phasing)
do not block generation — mark as TBD if missing.

### PRD additional scoring

All SRD fields plus:

| Field | Green - Sufficient | Yellow - Thin | Red - Missing |
|-------|-------------|--------|-----------|
| Frontend requirements | Platform-specific behavior described | General description only | No frontend spec |
| Data/business logic | Rules, sources, and edge cases defined | Some rules but gaps in edge cases | No logic described |
| Backend/API needs (PM layer) | Interfaces and data sources identified | Vague description | Not mentioned |

Optional fields (non-functional requirements, launch strategy) do not block generation — mark as TBD if missing.
