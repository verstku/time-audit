@AGENTS.md

# Фронтенд — правила

## Команды (из папки frontend/)

- запуск: `npm run dev` (http://localhost:3010; бэкенд на 8010 должен быть запущен)
- проверки: `npm run lint && npm run format:check && npm run typecheck`
- форматирование: `npm run format`
- unit-тесты: `npm run test` (Vitest)
- e2e-тесты: `npm run test:e2e` (Playwright; нужна запущенная БД; не запускать одновременно с pytest и `./scripts/check.sh`)
- типы API: `npm run gen:api`
- пакеты: `npm install <пакет>` (dev-зависимости — `npm install -D <пакет>`)

## Архитектура: FSD

Фронтенд построен по Feature-Sliced Design 2.1. Инструкция для Next.js:
https://feature-sliced.design/docs/guides/tech/with-nextjs — при сомнениях сверяйся с ней.

- `app/` (в корне frontend/) — только маршруты Next.js. Файлы `page.tsx`, `layout.tsx`, `route.ts` логики
  не содержат: они реэкспортируют готовое из `src/`.
- `src/` — только слои FSD, сверху вниз: `_app` → `_pages` → `widgets` → `features` → `entities` → `shared`.
  `_app` и `_pages` — слои FSD app и pages; подчёркивание убирает конфликт с папками Next.js.
- Импорт — только из слоёв ниже. Слайсы одного слоя друг друга не импортируют.
- Снаружи слайс импортируют только через его `index.ts`. Внутри слайса — относительные импорты.
- Импорт из `shared`: у сегментов `shared/api` и `shared/i18n` есть `index.ts`, импортируй только через него
  (`import { api } from "@/shared/api"`). Из `shared/ui` и `shared/lib` импортируют по файлу
  (`@/shared/ui/card`, `@/shared/lib/utils`): общего `index.ts` у них нет. Новый сегмент в `shared` (кроме `ui`
  и `lib`) сразу создавай с `index.ts`; папке внутри `shared/ui` или `shared/lib` тоже нужен свой `index.ts` —
  так требует правило Steiger `fsd/public-api`.
- Сегменты называй по назначению (что этот код делает), а не по виду файлов. Обычно хватает `ui`, `model`,
  `api`, `lib`, `config`. В `_app` и `shared` есть свои сегменты (сейчас это `entrypoint`, `styles`, `i18n`).
  Нужен сегмент с другим именем — предложи его в плане. Папок `components`, `hooks`, `utils`, `types`
  не создавай.
- Сначала в странице: новый код клади в слайс страницы в `_pages`. В `shared` — только то, что не знает
  о продукте: компоненты shadcn/ui, клиент API, утилиты, переводы.
- В `widgets`, `features`, `entities` код выносится, только когда он уже используется в двух местах. Такой
  вынос подтверждаю я: предложи его в спеке или плане либо спроси. Эти слои и пустые папки «на будущее»
  заранее не создавай.
- `npm run lint` проверяет структуру линтером Steiger (конфиг — `steiger.config.mjs`). Его правила не отключай
  и не обходи без моего разрешения.

## Код

- Тексты интерфейса — только в `messages/ru.json` и `messages/en.json` (ключи в обоих файлах одинаковые),
  в коде — через next-intl. Строками в коде не писать.
- Запросы к бэкенду — только через клиент `api` из `@/shared/api` (сам клиент — `src/shared/api/client.ts`).
- После изменения API бэкенда — `npm run gen:api` и закоммитить `openapi.json` и `src/shared/api/schema.d.ts`.
- Компоненты shadcn/ui — через `npx shadcn add <компонент>` (компоненты попадают в `src/shared/ui`, их хуки —
  в `src/shared/lib`), затем сразу `npm run format`: shadcn генерирует код не в стиле Prettier проекта, и без
  этого упадёт `format:check`.
- Цвета — только через токены темы из `globals.css` (классы вида `bg-background`, `text-muted-foreground`).
  Цвета прямо в коде (`#fff`, `bg-white`, `text-gray-500`) не пиши: с ними сломается тёмная тема. Нужен новый
  цвет — добавь токен сразу для светлой и тёмной темы. Исключение — цвет направления: его выбирает
  пользователь (BR-13).

## Тесты

- Vitest — только чистая логика без React и DOM, файлы `*.test.ts` рядом с кодом.
- e2e-тесты (Playwright) — в `e2e/`: пользовательские сценарии и интерфейс.

## Типы Next.js

- После клонирования и после `npm run test:e2e` выполнить `npm run typecheck` (или `npm run dev`), чтобы
  редактор видел типы Next.js: сборка для e2e переписывает `next-env.d.ts`.
