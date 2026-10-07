# AGENTS.md — Furniture-next (frontend)

Guide for AI coding agents and new developers working in `yotoqxonacom-hub/furniture-next`.
Read this file and `README.md`. The change history (migrated from **Nestar-next**) is kept **only in the backend repo**:
`yotoqxonacom-hub/Furniture` → `docs/Ai/` (frontend part: `docs/Ai/FRONTEND_MIGRATION.md`). This repo has no `docs/Ai` folder — do not create one.

## Project

Next.js storefront and admin panel for the Furniture marketplace. Talks to the Furniture NestJS backend
(`yotoqxonacom-hub/Furniture`, branch `develop`) over GraphQL (Apollo) and a raw WebSocket.

| Item | Value |
| --- | --- |
| Stack | Next.js 14.2 (pages router), React 18.2, TypeScript, MUI 5 + Emotion, Apollo Client 3, SCSS, next-i18next, SweetAlert2, Swiper, Toast UI editor |
| Languages | `en` (default, no prefix), `kr`, `uz`, `ru` |
| Main branch | `develop` |
| Backend env | `.env.local` from `.env.example` (API 3007, GraphQL `/graphql`, WS); Docker uses `.env` |

## Commands

```bash
cp .env.example .env.local
yarn install
yarn dev               # http://localhost:3000
yarn build
npx tsc --noEmit
yarn i18n:check        # fails if any locale misses a key
docker compose up -d   # production: http://localhost:4000 (needs .env)
```

## Folder Map

| Path | Contents |
| --- | --- |
| `pages/` | Routes: `/`, `/product`, `/product/detail`, `/agent`, `/agent/detail`, `/community`, `/community/detail`, `/cs`, `/mypage`, `/member`, `/cart`, `/order/checkout`, `/order/detail`, `/account/join`, `/about`, `/_admin/*` |
| `apollo/client.ts` | Apollo client: auth header, token refresh, upload link, error link |
| `apollo/store.ts` | Reactive vars: `userVar`, chat/socket vars, `cartCountVar` |
| `apollo/user/*`, `apollo/admin/*` | GraphQL documents (`query.ts`, `mutation.ts`) |
| `libs/components/` | `common`, `homepage`, `product`, `agent`, `community`, `cs`, `member`, `mypage`, `order`, `admin`, `layout`, `Top.tsx`, `Footer.tsx`, `Chat.tsx` |
| `libs/components/layout/` | `withLayoutMain` (LayoutHome), `withLayoutBasic`, `withLayoutFull`, `withAdminLayout` HOCs + `Shell` |
| `libs/hooks/` | `useCart`, `useOrderActions`, `useFollowActions`, `useLikeProduct`, `useLikeMember`, `useFaqs`, `useScrollRestoration`, `useDeviceDetect` |
| `libs/types/`, `libs/enums/` | Mirrors of backend DTOs and enums |
| `libs/config.ts` | `ORDER_RULES` (copy of backend), `communityTabs`, `CONTACTS`, sort/option lists |
| `libs/env.ts` | `API_URL`, `GRAPHQL_URL`, `WS_URL` with fallbacks |
| `libs/socket.ts`, `libs/chat.ts` | WebSocket connection and private chat helpers |
| `libs/member.ts` | `isAgent`, `isAdmin`, `isSameMember`, `profileHref`, My Page hrefs |
| `libs/i18n.ts` | `translate()` outside React, `intlLocale()` |
| `libs/errorMessage.ts`, `libs/sweetAlert.ts` | Readable errors and alerts |
| `scss/furniture/*.scss` | Page styles (responsive); `scss/admin/admin.scss` (desktop admin); `scss/MaterialTheme` |
| `public/locales/<locale>/common.json` | Translations (flat keys = English text) |
| `public/img/pages`, `public/img/furniture` | Page header photos, SVG icons/fallbacks |

## Rules

1. **Never push, merge or open a PR without the owner's explicit approval.** Show the diff first.
2. Every GraphQL document must match an existing backend operation on Furniture `develop`. Do not invent fields.
3. Mutations: wrap in `try/catch` and show **one** alert in the caller (`sweetErrorHandling` / `errorMessageOf`). Queries that poll or feed badges pass `context: { silent: true }`.
4. All UI text goes through `t('English text')` (or `translate()` outside React) and must be added to **all four** locale files; run `yarn i18n:check`.
5. One responsive markup: no separate mobile components; use the breakpoints 1100 / 900 / 600 px in `scss/furniture`. Only `/_admin` is desktop-only.
6. Colours/fonts come from the MUI theme and `scss/variables.scss` — no new hard-coded brand colours.
7. Role checks only through `libs/member.ts` helpers; `AddProductButton` already hides itself for non-sellers.
8. Use `libs/env.ts` for URLs; never read `process.env.REACT_APP_*` directly in components.
9. Keep `ORDER_RULES` identical to the backend `libs/config.ts`; the backend computes real totals.
10. Public pages export `getStaticProps` with `serverSideTranslations(locale, ['common'])` and are wrapped with a layout HOC; `/_admin` pages use `withAdminLayout` (English only, no locale props).
11. Real-estate field names stay in data (`productBeds` = Seats, `productRooms` = Pieces in set, `productSquare` = Size (cm), `productLocation` = City, `constructedAt` = Year made). Show the furniture labels.
12. Socket events are handled in `libs/socket.ts` and exposed through reactive vars; do not open extra sockets.
13. Code style: tabs, single quotes, trailing commas, printWidth 120 (`.prettierrc`).
14. Record frontend changes in the backend repo: `Furniture/docs/Ai/FRONTEND_MIGRATION.md` (+ `COMPLETED_TASKS.md`, `NEXT_STEPS.md`); update this repo's `README.md` when adding pages or rules.

## Definition of Done

- `npx tsc --noEmit` and `yarn build` pass; `yarn i18n:check` passes.
- Page works at desktop and 375 px width (except admin).
- Logged-out, user, seller (AGENT) and admin views checked where relevant.
- Change recorded in `Furniture/docs/Ai`.
- Diff shown to the owner before any push.

## Known Gaps

- README points to backend branch `feature/notice-notification`; the commerce pages need `develop`.
- `CONTACTS.facebook.url` is a placeholder.
- README mentions `openPrivateChat`; the real helper is `openChatWith` in `libs/chat.ts`.
- `ORDER_RULES` is duplicated from the backend.
