# Development Task Queue

> **Overview:** Sprint-level task queue. Agents execute tasks top to bottom within the current sprint. When a task is completed, mark it [x] and add a checkpoint entry. Future tasks are queued below for prioritisation in the next sprint.

---

## Current Sprint

> **Section summary:** Tasks actively being worked on. Agents pick the first incomplete task.

- [x] Bootstrap `.ai-system` for DMHicc and align with repo constraints.
- [x] Add CIS env/config plumbing plus status + webhook routes.
- [x] Add CIS persistence tables (`CisIdentity`, `CisWebhookEvent`) and record events.
- [x] Record CIS push-model decision and update architecture docs.

---

## Up Next

> **Section summary:** Tasks planned for the next sprint. Not yet started.

- [ ] Wire CIS identity events into optional user-link workflows once payload contract is finalized.
- [ ] Add admin diagnostics surface for CIS mappings (optional).

---

## Backlog

> **Section summary:** Known work that needs to be done but hasn't been scheduled yet.

- [ ] Add reconciliation endpoint to re-sync CIS identities on demand.
- [ ] Harden webhook idempotency metrics and retry visibility.

---

## Completed This Sprint

> **Section summary:** Tasks finished in the current sprint. Cleared at sprint end and moved to dev-history.md.

- [x] CIS federation handshake + persistence for DMHicc.

---

## Notes

None.
