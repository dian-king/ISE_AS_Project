# Excella International School — Reference Document

> This file was generated as part of rebranding the ISE Admissions System from Greenwood International School to Excella International School. It contains all publicly available information about Excella School gathered from web research, mapped to the data fields used in this project.

---

## 1. School Identity

| Field | Value |
|---|---|
| **Official Name** | Excella School |
| **Full/Portal Name** | Excella International School |
| **Motto / Tagline** | "In Pursuit of a Balanced Education" |
| **Location** | KG 103 St, Kimironko, Gasabo, Kigali, Rwanda |
| **Country** | Rwanda |
| **Email** | info@excellaschool.rw |
| **Phone** | +250 788 306 085 |
| **Website** | www.excellaschool.ac.rw |
| **Facebook** | https://www.facebook.com/p/Excella-School-100070099224230 |
| **Twitter / X** | @excellaeduc |

### Office Hours
| Day | Hours |
|---|---|
| Monday – Friday | 08:00 – 16:00 |
| Saturday | Closed |
| Sunday | Closed |

---

## 2. Educational Philosophy & Mission

Excella School is dedicated to providing a **holistic education** that nurtures children into **independent adults and changemakers**. The school blends the American Montessori approach with Rwanda's national curriculum, positioning teachers as **guides and facilitators** rather than traditional lecturers.

**Core values:**
- Independent thinking and personal freedom to explore
- Self-esteem, integrity, and life skills development
- Mentorship and character building
- Creative and critical thinking

**Accreditation:**
- Registered under the **American Montessori Society (AMS)**
- Currently at **Stage 5 of the AMS Pathway to Full Accreditation** (active for 3+ years)

---

## 3. Curriculum

Excella School offers two educational pathways:

| Pathway | Description |
|---|---|
| **Rwanda National Curriculum** | Follows the standard REB (Rwanda Education Board) curriculum for all levels |
| **American Montessori Program** | AMS-registered Montessori approach emphasising self-directed learning, mixed-age groups, and hands-on materials |

The Montessori program is applied at **Nursery and Primary** levels. At **Secondary**, students follow both National Curriculum and Montessori-informed options.

---

## 4. Programme Levels

| Level | Age Range | Grades (Rwanda System) | Curriculum |
|---|---|---|---|
| **Nursery** | Ages 2–6 | Baby Class, Nursery 1, Nursery 2, Nursery 3 | Montessori |
| **Primary** | Ages 6–13 | Primary 1 – Primary 6 | Montessori |
| **Secondary (Junior)** | Ages 13–16 | Senior 1 – Senior 3 | National + Montessori |
| **Secondary (Senior)** | Ages 16–19 | Senior 4 – Senior 6 | National Curriculum |

**Total age range served:** Ages 2–19

---

## 5. Fee Structure (Placeholder — Confirm with School)

> Excella School does not publish fee amounts publicly. The amounts below are carried over from the previous portal configuration. **Update these with actual figures from the school before going live.**

### Tuition Fees (RWF)

| Level | Annual Tuition | Per-Term Tuition | Registration Fee |
|---|---|---|---|
| Nursery | 2,100,000 | 700,000 | 150,000 |
| Primary | 2,550,000 | 850,000 | 150,000 |
| Junior Secondary (S1–S3) | 3,000,000 | 1,000,000 | 200,000 |
| Senior Secondary (S4–S6) | 3,600,000 | 1,200,000 | 200,000 |

### Additional Fees (RWF)

| Fee | Amount | Notes |
|---|---|---|
| Application Processing Fee | 50,000 | Non-refundable |
| Enrollment Confirmation Deposit | 500,000 | Refundable; applied to first term |
| School Bus (per term) | 150,000 | Varies by route |
| After-School Care (per term) | 120,000 | — |
| School Lunch (per term) | 100,000 | — |
| Extra-Curricular Activities (per term) | 50,000 | — |

### Payment Methods
- MTN Mobile Money (MoMo)
- Airtel Money
- Bank Transfer (BK, Equity, I&M, Cogebanque)
- Visa / Mastercard

---

## 6. Admissions

- Applications accepted via the online admissions portal
- Open to learners aged 2–19 (Nursery through Senior 6)
- Standard admissions process: application submission → document verification → academic review → interview (where applicable) → decision

### Required Documents (standard Rwanda international school requirements)
- Valid Rwandan National ID (Indangamuntu) or Passport
- Most recent school report cards / transcripts
- Birth Certificate
- Teacher recommendation letter(s)
- Completed medical information form
- National Exam Index Number (if applicable)

---

## 7. Branding

> Official brand colors were not available from public sources at time of research. The user will supply exact hex codes.

| Element | Current (Greenwood) | Excella (TBD) |
|---|---|---|
| Primary color | #0D4A2F (Forest Green) | TBD |
| Secondary color | #082D1D (Dark Green) | TBD |
| Accent color | #C9A227 (Gold) | TBD |

---

## 8. Project Files That Reference the School Name

The following files contain Greenwood-specific content that must be updated to Excella:

### Frontend
| File | Content to Update |
|---|---|
| [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx) | Page `<title>` metadata |
| [frontend/src/app/page.tsx](frontend/src/app/page.tsx) | School name, tagline, mission, stats, pillar descriptions |
| [frontend/src/app/contact/page.tsx](frontend/src/app/contact/page.tsx) | Address, phone, email, office hours |
| [frontend/src/app/fees/page.tsx](frontend/src/app/fees/page.tsx) | Fee schedule, payment terms |
| [frontend/src/app/faq/page.tsx](frontend/src/app/faq/page.tsx) | All FAQ answers mentioning Greenwood, curriculum info |
| [frontend/src/app/programs/page.tsx](frontend/src/app/programs/page.tsx) | Programme names, descriptions, Montessori framing |
| [frontend/src/app/admin/config/branding/page.tsx](frontend/src/app/admin/config/branding/page.tsx) | Default school name, tagline, contact defaults |
| [frontend/src/lib/api.ts](frontend/src/lib/api.ts) | Any hardcoded school references |

### Backend
| File | Content to Update |
|---|---|
| [backend/src/main/java/com/iseas/ise_as_backend/config/DataInitializer.java](backend/src/main/java/com/iseas/ise_as_backend/config/DataInitializer.java) | School name, address, email, tagline, programme seed data, notification templates |
| [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties) | Email sender name/address |

### Documentation
| File | Content to Update |
|---|---|
| [README.md](README.md) | School name, project description |

---

## 9. Sources

- [Excella School official website](https://www.excellaschool.ac.rw/)
- [Schools in Rwanda listing](https://schoolsinrwanda.com/listing/excella-school/)
- [The Campus — Excella School profile](https://www.thecampus.rw/campus/view/excella-school-kigali)
- [Excella School on Facebook](https://www.facebook.com/p/Excella-School-100070099224230/)
- [Vymaps listing](https://vymaps.com/RW/Excella-School-Rwanda-494962900660665/)
