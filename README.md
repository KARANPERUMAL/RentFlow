# RentFlow

RentFlow is a modern PG/Hostel Management Platform built as a premium SaaS dashboard, not a college-style CRUD screen.

## Stack

- Frontend: React 19, JavaScript, Vite, Tailwind CSS, shadcn-inspired primitives, Framer Motion, React Router, TanStack Query, React Hook Form, Zod, Axios, Lucide Icons
- Backend: Spring Boot, Spring Security, Spring Data JPA, MySQL-ready configuration, JWT, Swagger/OpenAPI, Lombok, MapStruct dependency included
- Database: H2 in-memory for local/demo reset on restart, MySQL via `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`

## Demo Login

- Email: `demo@rentflow.com`
- Password: `demo123`

Demo data is seeded on backend restart and uses a read-only demo account.

## Run

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
mvn spring-boot:run
```

Swagger is available at `http://localhost:8080/swagger-ui.html`.

## Architecture Notes

- Payments are stored in a dedicated `Payment` ledger. Tenants do not contain `isPaid`.
- Payment records include nullable gateway reference and transaction fields for Razorpay/Cashfree/PhonePe integration.
- Property, floor, room, bed, tenant and payment are separate domain models so multi-property, staff roles, receipts, reminders and document storage can be added without rewriting the core data model.
- Owner registration creates the building structure first. Tenant onboarding happens after setup.
