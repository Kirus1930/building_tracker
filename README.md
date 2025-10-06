# Vue 3 + Vite + Module Federation — практики к лекции

Рекомендуется Node.js 18+.

## Состав

- `practice1_monolith_vue/` — монолитный Vue‑SPA. Задание: вынести `Stats` в отдельный микрофронт и подключить в host.
- `practice2_host_vue/` + `practice2_remote_cart_vue/` + `practice2_remote_profile_vue/` — host и два remote (Cart, Profile). Добавьте `Reviews`.
- `practice5_contract_host_vue/` + `practice5_contract_reviews_vue/` — сценарий поломки контракта (`productId` → `id`).

## Порты
- host: 5173; cart: 5174; profile: 5175; contract-host: 5176; reviews: 5177

## Запуск
В каждой папке:
```bash
npm i
npm run dev
```
Откройте соответствующий `http://localhost:<port>`.

## Подсказки
- Плагин: `@originjs/vite-plugin-federation` (remotes/exposes/shared в `vite.config.js`).
- Общие зависимости: держите `vue` в `shared`, иначе получите дублирование рантайма.
- Для обмена событиями: пробрасывайте функции‑колбэки/кастомные события через props и `emit`.
- Для SSR‑эксперимента: можно объединить `@vue/server-renderer` и микрофронт, отдающий HTML из собственного Node‑сервера.
