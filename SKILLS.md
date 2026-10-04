# SKILLS.md — Furniture-next (frontend)

Step-by-step recipes for common jobs in this repo. Rules from `AGENTS.md` always apply
(no push without approval, all text translated in 4 locales, one responsive markup).

---

## Skill 1 — Add a new public page

1. Create `pages/<route>/index.tsx` (or `detail.tsx`) as a `NextPage`.
2. Add `export const getStaticProps = async ({ locale }: any) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });`
3. Use `const { t } = useTranslation('common')` for every visible string.
4. Wrap the export: `withLayoutBasic` (page header with photo), `withLayoutFull` (plain) or `withLayoutMain` (home).
5. Page header photo: add the file to `public/img/pages/` and map it in `libs/pageImages.ts`.
6. Styles: new section in the matching `scss/furniture/<area>.scss` (import it in `scss/furniture/index.scss` if it is a new file); include the 900 / 600 px breakpoints.
7. Links to the page from `Top.tsx` / `Footer.tsx` / My Page if needed.
8. Add all new keys to `public/locales/{en,kr,uz,ru}/common.json`; run `yarn i18n:check`.
9. Add the new route to the page table in `Furniture/docs/Ai/FRONTEND_MIGRATION.md`.

---

## Skill 2 — Use a new backend operation

1. Confirm the operation exists in the Furniture backend resolver (`develop`).
2. Types: `libs/types/<domain>/<domain>.ts` (+ `.input.ts`) mirroring the backend DTO; enums in `libs/enums/`.
3. Document: `apollo/user/query.ts` or `mutation.ts` (admin → `apollo/admin/*`), constant name in `UPPER_SNAKE_CASE` matching the operation.
4. Query: `useQuery(DOC, { variables, fetchPolicy: 'cache-and-network', notifyOnNetworkStatusChange: true })`; add `context: { silent: true }` for background/badge queries.
5. Mutation: `const [run] = useMutation(DOC)`; call inside `try/catch`, show success with `sweetTopSmallSuccessAlert` and errors with `sweetErrorHandling(err)`; refetch or update reactive vars.
6. Reusable logic → a hook in `libs/hooks/` (see `useCart`, `useOrderActions`).

---

## Skill 3 — Add or change a product field in the UI

1. Backend field must exist (see backend SKILLS.md Skill 2).
2. `libs/types/product/product.ts`, `product.input.ts`, `product.update.ts`.
3. Add the field to `GET_PRODUCT`, `GET_PRODUCTS`, `GET_AGENT_PRODUCTS`, `GET_FAVORITES`, `GET_VISITED` selections as needed.
4. Form: `libs/components/mypage/AddNewProduct.tsx` (state, edit prefill, submit payload).
5. Display: `common/ProductCard.tsx`, `pages/product/detail.tsx`; filter: `product/Filter.tsx` + `libs/productFilter.ts`.
6. Labels in all locales.

---

## Skill 4 — Cart, checkout and orders

1. Cart state: `useCart` hooks keep `cartCountVar` fresh; never update the badge by hand elsewhere.
2. Quantity limits: product `productStock` and `ORDER_RULES.MAX_CART_QUANTITY` (`QuantityStepper`).
3. Totals shown with `deliveryFeeFor()` are a **preview**; always display the totals returned by `createOrders`.
4. Checkout (`/order/checkout`): `CREATE_ORDERS` → `PAY_ORDERS` with a `PaymentMethod`; one order → `/order/detail?orderId=…`, several → My orders. If payment fails the unpaid orders wait in My orders until `PENDING_TTL_MINUTES`.
5. Status buttons: buyer cancel only in PENDING / PAID; seller actions follow PAID → PROCESSING → SHIPPED → DELIVERED (`useOrderActions`).
6. If `ORDER_RULES` change in the backend, change `libs/config.ts` in the same task.

---

## Skill 5 — Chat and live events

1. Connection lives in `libs/socket.ts` (one per tab, token in `?token=`, auto-reconnect).
2. Handle a new server event in the socket message switch and write the result into a reactive var in `apollo/store.ts`.
3. UI reads vars with `useReactiveVar`; open a private chat with `openChatWith(member)` from `libs/chat.ts`.
4. Public chat messages may lack `id/createdAt/read` on old servers — keep them optional.

---

## Skill 6 — Translations

1. Key = the English sentence: `t('Add to cart')`. No `:` or `.` nesting (separators are off).
2. Outside React (alerts, auth, upload): `translate('...')` from `libs/i18n.ts`.
3. Label maps (`productTypeLabel`, `orderStatusLabel`, …) are picked up by `scripts/i18n-keys.js`; runtime-only values go in its `EXTRA_KEYS`.
4. Add the key to `en`, `kr`, `uz`, `ru`; run `yarn i18n:check` (exit 1 means something is missing).
5. Dates/numbers: `intlLocale()` for `Intl` / moment locale.

---

## Skill 7 — Admin panel page

1. `pages/_admin/<area>/index.tsx`, wrap with `withAdminLayout`; add the menu item in `libs/components/admin/AdminMenuList.tsx`.
2. Tables/components in `libs/components/admin/<area>/`.
3. Documents in `apollo/admin/*` (`...ByAdmin` operations only).
4. Styles in `scss/admin/admin.scss` (desktop only). Admin text is English and is not checked by `i18n:check`.

---

## Skill 8 — Role-based UI

1. Read the user with `useReactiveVar(userVar)`.
2. Use `isAgent`, `isAdmin`, `isSameMember`, `canSeeAddProduct`, `profileHref` from `libs/member.ts`.
3. Seller-only actions: `<AddProductButton />`, `MyShopPanel`, seller orders on My Page.
4. Hide Message / Follow / Report buttons on the user's own profile or product.

---

## Skill 9 — Safe review before delivery

1. `git status` / `git diff --stat` — only intended files.
2. `npx tsc --noEmit`, `yarn build`, `yarn i18n:check`.
3. Check at desktop and 375 px; check logged-out, user, seller, admin.
4. `rg -n -i "nestar|propert" pages libs apollo` — only intentional legacy names (`productBeds` etc. are fine).
5. Record the change in the backend repo `Furniture/docs/Ai/` (`FRONTEND_MIGRATION.md`, `COMPLETED_TASKS.md`, `NEXT_STEPS.md`) and update `README.md`; show the diff to the owner; push only after approval.
