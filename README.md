# CryoVigil Frontend

CryoVigil is a laboratory operations and cold-chain monitoring platform designed to protect the viability of biological samples, reagents, and pharmaceutical materials. The frontend is a Vue 3 single-page application that provides a modular dashboard for monitoring storage conditions, detecting operational anomalies, and supporting traceability and regulatory reporting.

This repository reflects the product’s architecture and domain model as described in the project report, using a bounded-context structure to separate operational concerns such as alerts, analytics, laboratories, history, reports, and profiles.

## Overview

CryoVigil helps clinical and laboratory teams reduce risks caused by:

- thermal excursions in refrigerators, freezers, and cold rooms
- incorrect sample placement in storage compartments
- lack of real-time visibility into cold-chain conditions
- manual reporting and slow incident investigation
- audit and compliance gaps in bioclinical operations

The platform is intended for medium-sized laboratories, clinics, and hospital pharmacy environments that need reliable monitoring without a complex hardware-management burden.

## Goals

The product is designed to:

- monitor real-time temperature and environmental conditions
- identify abnormal storage behavior through threshold-based alerts
- validate sample placement against thermal and storage requirements
- provide operational history for investigations and audits
- generate traceability and reporting workflows for lab teams
- centralize laboratory monitoring in a single intuitive dashboard

## Tech Stack

- Vue 3
- Vite
- Vue Router
- Pinia
- Vue I18n
- PrimeVue + PrimeFlex + PrimeIcons
- Axios
- ESLint and Prettier
- JSON Server mock data structure for backend simulation

## Project Structure

```text
frontend/
├── README.md
├── LICENSE.md
├── CHANGELOG.md
├── Combined_Project_Report.pdf
├── docs/
│   ├── adrs.md
│   └── user-stories.md
├── index.html
├── package.json
├── public/
├── server/
│   ├── db.json
│   └── routes.json
├── src/
│   ├── alerts/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── analytics/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── history/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── laboratories/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── profiles/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── reports/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── shared/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── app.vue
│   ├── i18n.js
│   ├── main.js
│   ├── pinia.js
│   ├── router.js
│   ├── locales/
│   │   ├── en.json
│   │   └── es.json
│   └── style.css
└── vite.config.js
```

## Bounded Contexts

The frontend is organized around business domains instead of a single flat screen-first structure.

### Alerts
Handles operational anomalies, threshold breaches, incident notifications, and warning flows. This context supports early detection of cold-chain failures and sample-risk events.

### Analytics
Focuses on real-time dashboards, trends, monitoring indicators, and operational insight. It provides the high-level status view used by lab managers and technical staff.

### Laboratories
Represents facility-level information such as rooms, refrigerators, compartments, storage zones, and logistics planning. This is the operational core for sample placement and storage discipline.

### History
Tracks the timeline of events and historical records needed for incident review, process validation, and audit preparation.

### Reports
Supports compliance, traceability, and operational documentation. This context is intended to generate user-facing reports and regulatory summaries.

### Profiles
Covers user and settings management, including role-based context, preferences, and system configuration.

## Shared Context

Across all domains, the application shares common cross-cutting infrastructure:

- global app layout and navigation shell
- translation layer for English and Spanish
- router-based page composition and page titles
- shared HTTP infrastructure for API connectivity
- theme and brand styling for the CryoVigil product identity
- reusable base services and endpoint abstractions

Key shared files include:

- `src/shared/infrastructure/base-api.js`
- `src/shared/infrastructure/base-endpoint.js`
- `src/shared/presentation/components/layout.vue`
- `src/router.js`
- `src/i18n.js`
- `src/style.css`

## Layer Responsibilities

The codebase follows a layered structure aligned with a domain-driven frontend approach.

### Presentation Layer
Responsible for UI composition, route definition, layout, and user-facing interactions.

Examples:

- `src/**/presentation/*`
- `src/shared/presentation/components/*`
- `src/app.vue`
- `src/router.js`

### Application Layer
Contains feature use cases and orchestration logic between user flows and infrastructure.

Examples:

- `src/**/application/*`

### Domain Layer
Contains business concepts, models, and domain logic that define how each context behaves.

Examples:

- `src/**/domain/*`

### Infrastructure Layer
Handles HTTP client setup, API endpoints, persistence-adjacent access, and system integration.

Examples:

- `src/shared/infrastructure/*`
- `src/**/infrastructure/*`

## Running the Project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Optional mock backend:

The Laboratories page loads, creates, and deletes records through JSON Server, which writes them to `server/db.json`. Start the mock API and frontend in separate terminals:

```bash
npx json-server server/db.json --port 3000
```

```bash
npm run dev
```

The frontend uses `http://localhost:3000` by default, matching JSON Server's resource endpoints. Override it with `VITE_CRYOVIGIL_PLATFORM_API_URL` if the mock API is hosted elsewhere.

Settings are frontend-only mock preferences stored in browser local storage. Profile, sensor, and preference changes persist in that browser; password and authentication actions are demonstrations and are not connected to an authentication service.

## License

The repository currently contains a blank `LICENSE.md` placeholder, so no explicit license is assigned yet. Before public distribution or external reuse, the team should add an appropriate OSI-approved license, such as MIT or Apache 2.0.

## Summary

CryoVigil Frontend is a modular, domain-oriented dashboard for monitoring critical storage conditions with a focus on patient safety, operational traceability, and laboratory efficiency. The project is structured to scale from an MVP dashboard into a more complete product with analytics, alert systems, compliance reporting, and real-world lab operations support.
