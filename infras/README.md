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
