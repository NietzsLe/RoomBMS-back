# PostgreSQL Test Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo môi trường PostgreSQL test bằng Docker Compose, pgAdmin desktop kết nối qua localhost:5432

**Architecture:** Docker Compose chạy PostgreSQL container với port 5432 exposed, volume persist data, environment variables khớp `.env` hiện tại

**Tech Stack:** Docker, Docker Compose, PostgreSQL 16

---

## Task 1: Create docker-compose.yml

**Files:**
- Create: `infras/docker-compose.yml`

- [ ] **Step 1: Write docker-compose.yml**

```yaml
services:
  postgres:
    image: postgres:16
    container_name: roombms-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: "1"
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - roombms_pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  roombms_pgdata:
```

- [ ] **Step 2: Commit docker-compose.yml**

```bash
git add infras/docker-compose.yml
git commit -m "feat(infras): add docker-compose for postgres test environment"
```

---

## Task 2: Create README documentation

**Files:**
- Create: `infras/README.md`

- [ ] **Step 1: Write README.md**

```markdown
# Infrastructure Test Environment

Môi trường PostgreSQL test cho development local.

## Yêu cầu

- Docker Desktop đã cài đặt và đang chạy
- pgAdmin 4 (desktop) để quản lý database

## Khởi động PostgreSQL

```bash
cd infras
docker compose up -d
```

## Dừng PostgreSQL

```bash
cd infras
docker compose down
```

## Xem logs

```bash
cd infras
docker compose logs -f postgres
```

## Kết nối bằng pgAdmin

Mở pgAdmin 4 và tạo server mới với thông tin:

- **Host:** `localhost`
- **Port:** `5432`
- **Username:** `postgres`
- **Password:** `1`
- **Database:** `mydb`

## Reset database (xóa toàn bộ data)

```bash
cd infras
docker compose down -v
docker compose up -d
```

## Kiểm tra container đang chạy

```bash
docker ps | grep roombms-postgres
```
```

- [ ] **Step 2: Commit README.md**

```bash
git add infras/README.md
git commit -m "docs(infras): add README for postgres test environment"
```

---

## Task 3: Start and verify PostgreSQL

**Files:**
- Verify: `infras/docker-compose.yml`

- [ ] **Step 1: Start PostgreSQL container**

```bash
cd infras
docker compose up -d
```

Expected output:
```
[+] Running 2/2
 ✔ Volume "infras_roombms_pgdata"  Created
 ✔ Container roombms-postgres      Started
```

- [ ] **Step 2: Verify container is running**

```bash
docker ps --filter name=roombms-postgres
```

Expected: Container `roombms-postgres` with status `Up` and port `0.0.0.0:5432->5432/tcp`

- [ ] **Step 3: Check PostgreSQL logs**

```bash
docker compose logs postgres --tail 20
```

Expected: Logs showing `database system is ready to accept connections`

- [ ] **Step 4: Verify port 5432 is listening**

```bash
powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue | Select-Object LocalAddress,LocalPort,State | Format-Table -AutoSize"
```

Expected: Output showing port 5432 in LISTEN state

---

## Task 4: Test pgAdmin connection

**Files:**
- None (manual verification)

- [ ] **Step 1: Document connection test steps**

Hướng dẫn user test kết nối:

1. Mở pgAdmin 4
2. Right-click **Servers** → **Register** → **Server...**
3. Tab **General**: Name = `RoomBMS Local`
4. Tab **Connection**:
   - Host: `localhost`
   - Port: `5432`
   - Maintenance database: `mydb`
   - Username: `postgres`
   - Password: `1`
5. Click **Save**
6. Expand server tree, verify database `mydb` xuất hiện

- [ ] **Step 2: Verify connection successful**

User confirms: pgAdmin kết nối thành công và thấy database `mydb`

---

## Completion Checklist

- [ ] `infras/docker-compose.yml` created and committed
- [ ] `infras/README.md` created and committed
- [ ] PostgreSQL container running on port 5432
- [ ] pgAdmin desktop kết nối thành công
- [ ] All files committed to git
