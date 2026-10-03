# Taste
- Ships Next.js apps to Vercel for deployment (project also tracked in GitHub), and expects the agent to carry out deploy steps. Confidence: 0.5
- Prefers zero-setup, self-contained solutions over provisioning extra infrastructure: when offered a choice, picks the option that requires no dashboard/database configuration (in-memory seeded fallback) over adding a managed Postgres/KV store. Confidence: 0.4
- Wants changes scoped tightly to the requested feature and explicitly instructs the agent not to touch or alter unrelated functionality. Confidence: 0.85
- Expects the app to actually work in its deployed/serverless target, not just on localhost — reports deployment failures (e.g. Vercel 500s) and expects the agent to re-analyze the code, find the root cause, and fix it end-to-end. Confidence: 0.55
- Values a polished, "beautiful" frontend and expects new pages/features to match the existing app's visual design language and aesthetic (consistent look and feel across pages). Confidence: 0.85
- Design feedback is framed as outcomes, not implementation: asks for UI that is "beautiful, robust, professional and easy to use" rather than prescribing specific layouts or components — expects the agent to exercise taste on visual/polish decisions. Confidence: 0.7
