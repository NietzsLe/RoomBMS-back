# PostgreSQL Test Infrastructure Design

**Date:** 2026-04-03  
**Status:** Approved

## Overview

Tạo môi trường PostgreSQL test bằng Docker Compose để phục vụ development và testing local. pgAdmin desktop có thể kết nối trực tiếp qua localhost.

## Goals

- Chạy PostgreSQL container với cấu hình khớp `.env` hiện tại
- Expose port 5432 để pgAdmin desktop kết nối được
- Persist data qua volume để không mất dữ liệu khi restart
- Đơn giản, dễ start/stop/reset

## Architecture

### Directory Structure

```
infras/
├── docker-compose.yml    # Docker Compose config
└── README.md            # Usage instructions
```

### Docker Compose Configuration

**Service:** `postgres`
- Image: `postgres:16`
- Port mapping: `5432:5432` (host:container)
- Volume: `roombms_pgdata:/var/lib/postgresql/data`
- Environment variables (from `.env`):
  - `POSTGRES_USER=postgres`
  - `POSTGRES_PASSWORD=1`
  - `POSTGRES_DB=mydb`

### Connection Details

pgAdmin desktop connection:
- **Host:** `localhost`
- **Port:** `5432`
- **Username:** `postgres`
- **Password:** `1`
- **Database:** `mydb`

## Usage

### Start PostgreSQL
```bash
cd infras
docker compose up -d
```

### Stop PostgreSQL
```bash
cd infras
docker compose down
```

### View Logs
```bash
cd infras
docker compose logs -f postgres
```

### Reset Database (xóa toàn bộ data)
```bash
cd infras
docker compose down -v
docker compose up -d
```

## Implementation Tasks

1. Tạo thư mục `infras/`
2. Viết `docker-compose.yml` với config trên
3. Viết `README.md` với hướng dẫn sử dụng
4. Test: start container và kết nối bằng pgAdmin
5. Commit files vào git

## Non-Goals

- Không cần pgAdmin container (user đã có pgAdmin desktop)
- Không cần script phức tạp (Docker Compose đủ đơn giản)
- Không cần production config (chỉ cho test/dev)
