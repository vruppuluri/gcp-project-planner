server {
    listen       ${PORT};
    server_name  _;
    root         /usr/share/nginx/html;
    index        index.html;

    # Security headers
    add_header X-Content-Type-Options  "nosniff"         always;
    add_header X-Frame-Options         "SAMEORIGIN"       always;
    add_header X-XSS-Protection        "1; mode=block"    always;
    add_header Referrer-Policy         "strict-origin"    always;

    # Cache static assets aggressively, HTML never
    location ~* \.(js|css|png|svg|ico|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback — all routes served by index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Health check endpoint for Cloud Run
    location /healthz {
        access_log off;
        return 200 "ok";
        add_header Content-Type text/plain;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
