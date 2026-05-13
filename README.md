# Axenix Frontend

Фронтенд приложения для поиска маршрутов. Проект собран на Angular 21 и работает как SPA с обращением к backend API по префиксу `/api`.

## Стек

- Angular 21
- TypeScript
- RxJS
- PrimeNG

## Что делает приложение

Фронт реализует основной пользовательский сценарий поиска маршрутов:

- автокомплит пунктов отправления и прибытия;
- запуск поиска маршрутов;
- поллинг результатов поиска;
- сортировку и фильтрацию найденных маршрутов;
- отображение карточек маршрутов и агрегированной статистики.

## Требования

- Node.js 20+
- npm 11+

В репозитории уже используется `npm`, это зафиксировано в `package.json` и `angular.json`.

## Установка зависимостей

```bash
npm install
```

## Локальный запуск

```bash
npm start
```

По умолчанию dev-сервер поднимается на:

```text
http://localhost:4200
```

## Запуск через Docker

Для фронта добавлен отдельный `docker-compose.yml` в директории `axenix-frontend`.

Запуск:

```bash
docker compose up --build
```

После старта приложение будет доступно на:

```text
http://localhost:4200
```

Остановка:

```bash
docker compose down
```

Этот сценарий поднимает Angular dev server внутри контейнера и монтирует исходники в `/app`, поэтому изменения в коде подхватываются без пересборки образа.

## Подключение к backend

Во время локальной разработки Angular использует proxy-конфиг [proxy.conf.json](/Users/arseniy/axenix-project/axenix-frontend/proxy.conf.json), который проксирует запросы:

```text
/api -> http://localhost:8000
```

При запуске через Docker используется отдельный proxy-конфиг [proxy.conf.docker.json](/Users/arseniy/axenix-project/axenix-frontend/proxy.conf.docker.json):

```text
/api -> http://host.docker.internal:8000
```

Для нормальной работы фронта backend должен быть доступен на `http://localhost:8000`.

Основные используемые endpoint'ы:

- `GET /api/locations`
- `POST /api/searches`
- `GET /api/searches/{search_id}/results`

## Полезные команды

Запуск dev-сервера:

```bash
npm start
```

Сборка production-бандла:

```bash
npm run build
```

Сборка в watch-режиме:

```bash
npm run watch
```

Запуск unit-тестов:

```bash
npm test
```

## Структура проекта

```text
src/app/
  core/
    api/                 API-сервисы, типы и сборка query params
  feature/
    search/              состояние поиска и поллинг результатов
    search-form/         форма поиска
    search-stats/        блок со статистикой по найденным маршрутам
    route-filters/       фильтры результатов
    route-results/       карточки маршрутов и toolbar
  shared/
    layout/              общие layout-компоненты
    ui/                  базовые UI-компоненты
```

## Архитектура

Приложение построено вокруг `SearchStateService`, который:

- отправляет запрос на создание поиска;
- хранит `searchId`, статус, результаты и ошибки;
- запускает поллинг результатов;
- переиспользует текущие фильтры и сортировку при повторной загрузке данных.

API-слой вынесен в `src/app/core/api`:

- [searches.api.ts](/Users/arseniy/axenix-project/axenix-frontend/src/app/core/api/searches.api.ts)
- [locations.api.ts](/Users/arseniy/axenix-project/axenix-frontend/src/app/core/api/locations.api.ts)

Точка входа страницы находится в:

- [app.ts](/Users/arseniy/axenix-project/axenix-frontend/src/app/app.ts)
- [app.html](/Users/arseniy/axenix-project/axenix-frontend/src/app/app.html)

## Сборка

Production-сборка складывается в директорию:

```text
dist/axenix-frontend
```

Команда:

```bash
npm run build
```

Также добавлен multi-stage [Dockerfile](/Users/arseniy/axenix-project/axenix-frontend/Dockerfile):

- `dev` stage для локальной разработки через `docker compose`;
- `build` stage для production-сборки Angular;
- `prod` stage на базе `nginx`, если позже понадобится отдавать статический бандл из контейнера.

## Примечания

- Базовый URL API задается через `API_BASE_URL` и по умолчанию равен `/api`.
- Если backend недоступен или возвращает ошибку, фронт показывает состояние ошибки в основном контентном блоке.
- Если поиск завершился без результатов, фронт показывает пустое состояние без падения страницы.
