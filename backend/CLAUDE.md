# Бэкенд — правила

## Команды (из папки backend/)
- запуск:          uv run uvicorn app.main:app --reload --port 8010
- тесты:           uv run pytest
- линтеры и типы:  uv run ruff check . && uv run ruff format --check . && uv run mypy app
- миграции:        uv run alembic upgrade head
- новая миграция:  uv run alembic revision --autogenerate -m "add example table"
- пакеты:          uv add <пакет> (dev-зависимости — uv add --dev <пакет>)

## Код
- Эндпоинты, которые работают с БД, — обычный `def`, не `async def`: SQLAlchemy у нас синхронный.
- Адрес БД берётся только из `get_settings().effective_database_url` (его используют `engine` и `alembic/env.py`).
  Свой выбор адреса не писать.
- Доступ к БД в коде приложения — только через зависимость `get_db`. `SessionLocal` напрямую не использовать:
  во время pytest он смотрит на рабочую `time_audit`, а не на `time_audit_test`.
- Момент времени (когда что-то произошло) храним как `DateTime(timezone=True)` (в PostgreSQL — `timestamptz`),
  в коде — datetime с часовым поясом в UTC: `datetime.now(UTC)`. `datetime.utcnow()` и datetime без пояса
  не использовать. Календарную дату по поясу пользователя (BR-02) это правило не заменяет: как её хранить,
  решает спека фичи.

## Модели и миграции
- Модели наследуют `Base` из `app/models/base.py` и реэкспортируются в `app/models/__init__.py` — иначе их
  не увидит Alembic.
- Миграции создаются через `uv run alembic revision --autogenerate -m "add example table"`. Описание миграции —
  по-английски: оно попадает в имя файла. Автосгенерированную миграцию
  всегда просматривать: переименование колонки autogenerate видит как удаление и создание — исправлять вручную
  на `op.alter_column`.

## API и фронтенд
- После изменения эндпоинтов или схем — `npm run gen:api` в папке frontend/ и закоммитить `frontend/openapi.json`
  и `frontend/src/shared/api/schema.d.ts`. Иначе `./scripts/check.sh` и CI упадут на проверке свежести типов API.

## Тесты
- Тесты с БД — через фикстуры `client` (TestClient) и `db_session` из `tests/conftest.py`. Каждый тест работает
  в транзакции, которая откатывается: даже `session.commit()` ничего не сохраняет.
- Перед первым тестом с `caplog` добавить `disable_existing_loggers=False` в вызов `fileConfig` в `alembic/env.py`:
  фикстура применяет миграции внутри pytest, и без этого `fileConfig` отключает логгеры приложения.
- Каждый эндпоинт, который отдаёт или меняет данные пользователя, работает только с данными текущего
  пользователя (BR-01). К каждому такому эндпоинту — тест: другой пользователь не может ни прочитать,
  ни изменить эти данные. Какой ответ он получает, задаёт «Контракт API» в спеке.
