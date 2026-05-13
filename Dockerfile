FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .


FROM base AS dev

EXPOSE 4200

CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "4200", "--proxy-config", "proxy.conf.docker.json"]


FROM base AS build

RUN npm run build


FROM nginx:1.27-alpine AS prod

COPY --from=build /app/dist/axenix-frontend /usr/share/nginx/html

EXPOSE 80
