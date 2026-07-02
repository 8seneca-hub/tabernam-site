# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into tabernam-site. PostHog is initialized via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), with a reverse proxy configured in `next.config.ts` to route events through `/ingest` — improving reliability against ad blockers. Environment variables are set in `.env.local`. Eleven events are tracked across six files, covering the full user journey from globe exploration to CV requests and contact intent.

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `globe_explore_opened` | User clicks "Explore the globe" CTA to open the interactive globe. | `src/app/home/globe/GlobeSection.tsx` |
| `globe_city_selected` | User clicks a city pin on the globe to open the city detail card. | `src/app/home/globe/GlobeSection.tsx` |
| `globe_region_changed` | User switches between globe regions (World, Europe, Asia, etc.). | `src/app/home/globe/GlobeSection.tsx` |
| `globe_explore_now_clicked` | User clicks "Explore now" on a city card to navigate to the activity detail page. | `src/app/home/globe/PinDetailCard.tsx` |
| `activity_page_viewed` | User views an activity/city detail page, indicating engagement with a specific location. | `src/app/activities/ActivityContent.tsx` |
| `cv_full_view_cta_clicked` | User clicks the "View Full CV" button to open the CV request modal. | `src/app/cv/CVSection.tsx` |
| `cv_request_submitted` | User submits the CV request form, triggering a mailto link. | `src/app/cv/RequestCvModal.tsx` |
| `contact_email_clicked` | User clicks an email address link on the contact page. | `src/app/contact/ContactContent.tsx` |
| `contact_phone_clicked` | User clicks the phone number link on the contact page. | `src/app/contact/ContactContent.tsx` |
| `contact_website_clicked` | User clicks the website link on the contact page. | `src/app/contact/ContactContent.tsx` |
| `language_switched` | User changes the display language via the language switcher in the header. | `src/components/layout/LangSwitcher.tsx` |

## Files created / modified

- **Created**: `instrumentation-client.ts` — PostHog client-side initialization
- **Modified**: `next.config.ts` — Added `/ingest` reverse proxy rewrites
- **Modified**: `.env.local` — Added `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics (wizard)](https://eu.posthog.com/project/214171/dashboard/787967)
- **Insight**: [Globe exploration engagement](https://eu.posthog.com/project/214171/insights/mmhCnPYV) — Globe opens and city selections over time
- **Insight**: [Globe to activity conversion funnel](https://eu.posthog.com/project/214171/insights/2QjocXFQ) — Funnel from globe open → city selected → Explore Now clicked
- **Insight**: [CV request conversion](https://eu.posthog.com/project/214171/insights/BWnBl2Vs) — CV CTA clicks vs. completed submissions
- **Insight**: [Contact intent actions](https://eu.posthog.com/project/214171/insights/H42aDYAH) — Email, phone, and website clicks on the contact page
- **Insight**: [Language switches by target language](https://eu.posthog.com/project/214171/insights/0bbXzhwS) — Which languages users switch to

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any deployment environment configs (Vercel, Docker, etc.) so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or equivalent) into CI so production stack traces de-minify in PostHog Error Tracking.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
