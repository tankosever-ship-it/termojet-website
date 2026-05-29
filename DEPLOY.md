# Деплой на Hetzner VPS

## Перший деплой

```bash
# 1. Підключись до сервера
ssh root@<IP>

# 2. Клонуй репозиторій
cd /root
git clone https://github.com/tankosever-ship-it/termojet-website.git
cd termojet-website

# 3. Створи директорії для даних (будуть монтуватись як volume)
mkdir -p data uploads

# 4. Запусти
docker compose up -d --build
```

Сайт буде доступний на `http://<IP>:3000`

---

## Nginx reverse proxy (HTTPS)

Якщо є домен і nginx на сервері — додай конфіг:

```nginx
server {
    listen 80;
    server_name termojet.com.ua www.termojet.com.ua;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 20m;
    }
}
```

HTTPS: `certbot --nginx -d termojet.com.ua`

---

## Оновлення сайту

```bash
cd /root/termojet-website
git pull
docker compose up -d --build
```

---

## Важливо

- `data/termojet.db` — SQLite база з усіма продуктами, замовленнями тощо
- `uploads/` — завантажені фото
- Обидва директорії монтуються як volumes — **не видаляються при оновленні**
- При першому запуску автоматично seed-уються 284 продукти
