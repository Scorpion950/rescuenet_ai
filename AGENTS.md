# RescueNet AI engineering guidance

- For UI changes, read and follow .agents/skills/frontend-design/SKILL.md.
- This is an emergency-response demonstration until verified organizations are
  connected. Never imply that an alert reached real emergency services.
- Preserve clean, high-contrast, responsive interfaces. The SOS flow must be
  usable with one hand and without relying on color alone.
- API routes perform writes, not untrusted Firestore clients. Check roles using
  verified Firebase ID tokens and deployed Firestore Security Rules.
- Never commit credentials, phone numbers, private GPS history, or real user data.
- Validate location coordinates, media types, and state transitions.
- Keep tests independent of production Firebase or external alert providers.
