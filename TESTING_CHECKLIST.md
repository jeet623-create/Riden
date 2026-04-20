# RIDEN End-to-End Test Checklist

## Setup
- [ ] Claude seeds fake operator + driver via SQL (ask in chat)
- [ ] Admin account confirmed: jeet@riden.app
- [ ] Test DMC account confirmed (or register new)
- [ ] LINE OA added on phone

## Flow 1 — DMC signup to activation
- [ ] Register DMC account via /dmc/register
- [ ] Email confirmation works
- [ ] First login redirects to dashboard
- [ ] Trial banner shows 60 days left
- [ ] LINE Connect banner appears
- [ ] Admin sees new DMC in /admin/dmcs
- [ ] Admin sees DMC in /admin/subscriptions Awaiting queue
- [ ] Admin can activate with Starter plan + fake proof
- [ ] DMC portal reflects active status after refresh

## Flow 2 — Booking creation
- [ ] Click "+ New Booking" from dashboard
- [ ] Step 1: all fields save correctly
- [ ] Step 2: day accordion expands/collapses, pax varies per day, sightseeing shows hours
- [ ] Step 3: three radio options work, operator multi-select works
- [ ] Submit: booking + trips both insert without RLS errors
- [ ] Confirmation card shows share text
- [ ] Copy button copies
- [ ] WhatsApp button opens wa.me with pre-filled text

## Flow 3 — Booking dispatch to LINE
- [ ] Operator receives LINE Flex Message
- [ ] Message content matches the booking
- [ ] Operator taps Accept — trip status updates
- [ ] DMC dashboard reflects new status

## Flow 4 — Driver registration (LINE chatbot)
- [ ] New LINE user messages bot → registration flow starts
- [ ] All questions answered → driver row created
- [ ] Driver appears in /admin/pending queue
- [ ] Admin approves → driver is_verified=true
- [ ] Driver receives "approved" LINE notification (if driver-approved edge fn deployed)

## Flow 5 — Admin dashboard health
- [ ] Pulse strip shows real numbers
- [ ] MRR reflects the new activation
- [ ] Recent activity feed shows the new booking
- [ ] Recent signups shows the new DMC

## Known gaps
- driver-approved / driver-rejected / driver-needs-info edge fns not deployed (LINE notifications skipped)
- subscription_activated email template may not exist (activation email skipped)
- Phase 3c (booking detail), 3i (finance), 3j (support) not built yet
