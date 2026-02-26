# 1. SYSTEM ARCHITECTURE

## 1.1 Architectural Pattern

Use a **Modular Monolith (Service-Oriented)**

Why:

* Faster MVP delivery than microservices
* Clean separation of domains
* Easily splittable later into microservices

---

## 1.2 High-Level Architecture

```
[ Client Layer ]
Next.js (UI)
Antd Components
Tailwind Styling

        ↓

[ Application Layer ]
Campaign Service
Link Engine
Referral Engine
Gamification Engine
Donation Engine
Fraud Detection Service
Analytics Service

        ↓

[ Infrastructure Layer ]
PostgreSQL (via Prisma)
Redis (cache + queues)
Cloudinary (media)
```

---

## 1.3 Module Breakdown

| Module             | Responsibility             |
| ------------------ | -------------------------- |
| Auth Module        | Registration, login, roles |
| Campaign Module    | Create/manage campaigns    |
| Link Engine        | Generate trackable links   |
| Engagement Module  | Clicks, views              |
| Referral Module    | User invites               |
| Points Engine      | Scoring                    |
| Leaderboard Engine | Ranking                    |
| Donation Module    | Contribution tracking      |
| Trust Engine       | Fraud detection            |
| Analytics Module   | Insights                   |

---

## 1.4 Scalability Design

* Redis for:

  * leaderboard caching
  * click tracking
  * rate limiting
* Cloudinary for:

  * campaign media
* Queue-ready architecture for:

  * future background processing

---

# 2. DATABASE SCHEMA (Prisma-Oriented)

## 2.1 Core Models

---

### User

```
User
- id
- name
- email
- role
- trustScore
- createdAt
```

---

### Campaign

```
Campaign
- id
- title
- description
- status
- startDate
- endDate
- createdBy
```

---

### CampaignParticipation

```
CampaignParticipation
- id
- userId
- campaignId
- joinedAt
```

---

### SmartLink

```
SmartLink
- id
- userId
- campaignId
- slug
- expiresAt
- createdAt
```

---

### LinkEvent

```
LinkEvent
- id
- linkId
- type (click/view/conversion)
- device
- location
- referrer
- timestamp
```

---

### Referral

```
Referral
- id
- inviterId
- invitedUserId
- campaignId
- createdAt
```

---

### Donation

```
Donation
- id
- campaignId
- userId
- amount
- source
- createdAt
```

---

### PointsLedger

```
PointsLedger
- id
- userId
- campaignId
- type (IP, CP, LP, RP)
- value
- createdAt
```

---

### LeaderboardSnapshot

```
LeaderboardSnapshot
- id
- campaignId
- userId
- score
- rank
- snapshotDate
```

---

### TrustScore

```
TrustScore
- userId
- behaviorScore
- fraudFlags
- lastUpdated
```

---

# 3. ROLE PERMISSION MATRIX

| Feature               | User | Team Lead | Admin | Super Admin |
| --------------------- | ---- | --------- | ----- | ----------- |
| Join Campaign         | ✓    | ✓         | ✓     | ✓           |
| Share Links           | ✓    | ✓         | ✓     | ✓           |
| Invite Users          | ✓    | ✓         | ✓     | ✓           |
| View Personal Stats   | ✓    | ✓         | ✓     | ✓           |
| View Team Stats       | -    | ✓         | ✓     | ✓           |
| Create Campaign       | -    | -         | ✓     | ✓           |
| Edit Campaign         | -    | -         | ✓     | ✓           |
| End Campaign          | -    | -         | ✓     | ✓           |
| Manage Rewards        | -    | -         | ✓     | ✓           |
| View Global Analytics | -    | -         | ✓     | ✓           |
| Manage Users          | -    | -         | -     | ✓           |

---

# 4. MVP SCOPE

## Phase 1 Core Capabilities

Must include:

### User System

* Registration
* Login
* Role assignment

---

### Campaign

* Create campaign
* Join campaign
* Campaign dashboard

---

### Smart Links

* Unique link per user per campaign
* Click tracking

---

### Engagement Tracking

* Clicks
* Referrals

---

### Leaderboard

* Individual ranking

---

### Basic Points Engine

* Points for:

  * Clicks
  * Referrals

---

### Analytics

* Personal performance
* Campaign performance

---

# 5. SPRINT BREAKDOWN

Assuming 2-week sprints.

---

## Sprint 1 — Foundation

* Auth system
* Prisma setup
* User roles
* Campaign model

---

## Sprint 2 — Campaign Engine

* Campaign creation
* Join campaign
* Participation tracking

---

## Sprint 3 — Smart Link Engine

* Link generation
* Slug system
* Expiry support

---

## Sprint 4 — Engagement Tracking

* Click logging
* Redis caching layer

---

## Sprint 5 — Referral System

* Invite tracking
* Attribution logic

---

## Sprint 6 — Points Engine

* Points ledger
* Reward scoring logic

---

## Sprint 7 — Leaderboard

* Ranking algorithm
* Redis caching

---

## Sprint 8 — Dashboard

* User analytics
* Campaign stats

---

## Sprint 9 — Trust System

* Basic anomaly detection
* Suspicious behavior flags

---

## Sprint 10 — MVP Stabilization

* Performance tuning
* Edge case handling
* Deployment readiness

---

# 6. SCALABILITY FUTURE-READY HOOKS

Already enabled:

* Queue-ready events
* Redis-backed stats
* Shardable link model
* Snapshot leaderboards

---

# 7. COPILOT-READY STRUCTURE

Recommended repo structure:

```
/modules
  /auth
  /campaign
  /link
  /referral
  /points
  /leaderboard
  /donation
  /trust
  /analytics
```

---

