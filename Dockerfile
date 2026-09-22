# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS client-builder
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
WORKDIR /build/client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

#---------

FROM golang:1.25-alpine AS server-builder
WORKDIR /build/server

RUN apk add --no-cache gcc musl-dev

COPY server/go.mod server/go.sum ./
RUN go mod download

COPY server/ ./
RUN CGO_ENABLED=1 go build -trimpath -ldflags="-s -w" -o /out/wam .

#---------

FROM alpine:3.22 AS runtime
WORKDIR /app

ENV GIN_MODE=release
ENV PORT=8000
ENV MODE=production
ENV SQLITE_PATH=/data
ENV SQLITE_NAME=sqlite.db
ENV PUBLIC_DIR=/app/dist

COPY --from=server-builder /out/wam /app/wam
COPY --from=server-builder /build/server/sql /app/sql

COPY --from=client-builder /build/client/dist /app/dist
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod 755 /app/docker-entrypoint.sh

VOLUME ["/data"]
EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["start-server"]
