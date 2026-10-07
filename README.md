# CozyLife — Next.js frontend

Modern furniture marketplace frontend (brand: **CozyLife**) for the **Furniture** NestJS backend
(`yotoqxonacom-hub/Furniture`, branch `feature/notice-notification`).

## Run

```bash
cp .env.example .env.local   # point it to your backend
yarn install                 # or npm install
yarn dev                     # http://localhost:3000
```

## What's inside

- **Responsive everywhere** (except the admin panel): one markup, CSS breakpoints at 1100 / 900 / 600px,
  mobile header with drawer menu, filter drawer on the shop page, horizontal card rails on phones.
- **Shop**: categories (sofa, corner sofa, armchair, bed, pouf, mattress, kids), filters (category, city,
  seats, pieces, price, size, barter), sorting, product detail with gallery, reviews and similar pieces.
- **Reports**: logged-in members can report a product, a seller or an article (`createReport`).
  *My Page → My reports* shows every report with its status (in review / resolved / rejected).
- **Notifications**: bell in the header with unread counter, mark one / all as read.
- **Help center**: notices, FAQ (searchable) and terms — all loaded from the backend notice module.
- **Admin** (`/_admin`): users, products, community, **reports** (resolve → seller warning / reject),
  **FAQ**, **notices** (NOTICE / TERMS / INQUIRY) and **notifications** — all connected to the backend.
- **Roles** (helpers in `libs/member.ts`: `isAgent`, `isSameMember`, `profileHref`, `ADD_PRODUCT_HREF`):
  - an agent sees **themself** in *Sellers* (card marked "You" + a *Your shop* panel);
  - agents add products from *My Page → Add product*, from the *Shop* toolbar / empty state, from their own
    seller page and from the header menu — all through `<AddProductButton />`, which renders nothing for non-agents;
  - on another member's or agent's page any logged-in user gets a **Message** button that opens a private chat
    (`openPrivateChat` in `libs/chat.ts`); the button is hidden on your own page.
- **Languages**: English (`en`), Korean (`kr`), Uzbek (`uz`), Russian (`ru`) — see *Translations* below.
- **Page photos**: every page header uses a photo from `public/img/pages/` (mapping in `libs/pageImages.ts`);
  the home hero and the home announcement use `mainpage.jpg`. To change a photo, replace the file and keep its name.
- **Home**: *Rooms we love* shows the most-liked real product photo of each room (falls back to an SVG when a
  room has no products yet) and a muted, looping YouTube video (`libs/components/homepage/HomeVideo.tsx`).
- Category icons and fallbacks in `public/img/furniture` are hand-made SVGs.

## Translations

- Files: `public/locales/{en,kr,uz,ru}/common.json`. Keys are the English text itself, so a missing key
  still shows readable English.
- Inside components use `const { t } = useTranslation('common')`; outside React (alerts, auth, upload)
  use `translate()` from `libs/i18n.ts`.
- After adding UI text run `yarn i18n:check` — it scans `pages/` and `libs/` and lists keys missing
  in any locale (exits with code 1 if something is missing). `node scripts/i18n-keys.js --list` prints all keys.

## Folder map

| Path | Purpose |
| --- | --- |
| `pages/` | routes (`/product`, `/agent`, `/community`, `/cs`, `/mypage`, `/member`, `/_admin/*`) |
| `libs/components/common` | shared cards, report modal, `AddProductButton` |
| `libs/components/agent/MyShopPanel.tsx` | "Your shop" panel an agent sees on the Sellers page |
| `libs/member.ts` | role helpers and common My Page links |
| `libs/i18n.ts` | `translate()` for non-React code, `intlLocale()` for dates |
| `scripts/i18n-keys.js` | translation coverage check |
| `libs/components/mypage` | My Page sections incl. `MyReports` |
| `libs/components/admin/cs/NoticeManager.tsx` | admin CRUD for FAQ / notices |
| `apollo/` | GraphQL operations (user + admin) |
| `scss/app.scss`, `scss/furniture/*` | design system + page styles |
