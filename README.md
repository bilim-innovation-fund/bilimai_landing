# Bilim AI Landing

Маркетинговый лендинг Bilim AI на Next.js.

## Development

```bash
pnpm install
pnpm dev
```

Приложение откроется на `http://localhost:3000`.

## Настройка окружения

Скопируйте `.env.example` в `.env.local`. Основные параметры:

- `NEXT_PUBLIC_APP_URL` — адрес основного приложения для ссылок на материалы;
- `NEXT_PUBLIC_WAITLIST_API_URL` — публичный endpoint списка ожидания из Swagger;
- `API_PROXY_TARGET` — сервер BilimAI API;
- `WAITLIST_API_URL` — необязательный полный адрес endpoint списка ожидания.

Форма сначала обращается к BilimAI API напрямую, а при ограничениях CORS использует серверный маршрут `/api/waitlist`. Если серверный процесс не может установить исходящее соединение, используется поддерживаемый API запрос `application/x-www-form-urlencoded`, не требующий CORS-префлайта.

## Production

```bash
pnpm build
pnpm start
```
