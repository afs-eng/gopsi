# Deploy de Produção

Este projeto possui uma base de produção com Docker Compose, Nginx, Gunicorn,
PostgreSQL, Redis, Celery e Celery Beat.

Para deploy gerenciado com backend no Render e frontend no Vercel, use
`docs/deploy-render-vercel.md`.

## Pré-requisitos

- Domínio apontando para o servidor.
- Docker e Docker Compose instalados.
- Certificados TLS válidos.
- Backups configurados para banco e arquivos de mídia.
- Variáveis de ambiente revisadas por alguém responsável pela operação.

## Arquivos de Produção

- `docker-compose.prod.yml`: stack de produção.
- `.env.production.example`: modelo de variáveis obrigatórias.
- `deploy/nginx/default.conf`: proxy HTTPS para backend e frontend.
- `frontend/Dockerfile.prod`: build otimizado do Next.js.
- `scripts/entrypoint.prod.sh`: collectstatic e migrations opcionais.

## Configuração Inicial

1. Copie o arquivo de ambiente:

```bash
cp .env.production.example .env.production
```

2. Edite `.env.production` e altere obrigatoriamente:

- `DJANGO_SECRET_KEY`
- `ALLOWED_HOSTS`
- `CSRF_TRUSTED_ORIGINS`
- `CORS_ALLOWED_ORIGINS`
- `DATABASE_URL`
- `POSTGRES_PASSWORD`
- `NEXT_PUBLIC_API_BASE_URL`

3. Instale certificados em:

```text
deploy/certs/fullchain.pem
deploy/certs/privkey.pem
```

4. Suba a stack:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Para validar a configuração usando o arquivo de exemplo sem subir serviços:

```bash
ENV_FILE=.env.production.example docker compose --env-file .env.production.example -f docker-compose.prod.yml config
```

5. Rode migrations uma vez:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec web uv run python manage.py migrate --noinput
```

Alternativamente, defina `RUN_MIGRATIONS=true` apenas durante um deploy controlado.

6. Crie o primeiro superusuário:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec web uv run python manage.py createsuperuser
```

## Segurança Obrigatória

- `DEBUG=False` em produção.
- `DJANGO_SECRET_KEY` forte e exclusivo do ambiente.
- HTTPS ativo antes de expor dados reais.
- `ALLOWED_HOSTS` restrito ao domínio real.
- `CSRF_TRUSTED_ORIGINS` com `https://`.
- Backups criptografados e restauração testada.
- Logs sem senha, token, chaves de API, dados completos de cartão ou conteúdo clínico desnecessário.
- Rate limiting configurado por `DRF_ANON_THROTTLE_RATE` e `DRF_USER_THROTTLE_RATE`.
- MFA deve ser habilitado para superadmins e administradores de clínica antes de uso real.
- Acompanhe `GET /api/v1/audit/` e `GET /api/v1/privacy/requests/` na rotina operacional.

## Serviços

- `nginx`: proxy HTTPS.
- `frontend`: Next.js em modo production.
- `web`: Django via Gunicorn.
- `celery`: processamento assíncrono.
- `celery-beat`: agendamentos.
- `postgres`: banco de dados.
- `redis`: broker/result backend.

## Health Check

Após subir:

```bash
curl -I https://SEU_DOMINIO/health/
```

## Backups

Banco:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup.sql
```

Mídia:

```bash
docker run --rm -v plataforma-psi_mediafiles:/media -v "$PWD":/backup alpine tar czf /backup/media.tar.gz /media
```

Teste restauração periodicamente. Backup não testado não é backup confiável.

## CI/CD

O workflow `.github/workflows/ci.yml` executa:

- `ruff`
- `pytest`
- `manage.py check`
- lint do frontend
- build do frontend

Antes de automatizar deploy, use staging com uma cópia segura da configuração de produção.

## Itens Ainda Externos

O código está preparado, mas produção real ainda exige contas/chaves externas para:

- provedor transacional de e-mail/SMS/WhatsApp;
- gateway de pagamento;
- provedor definitivo de vídeo, caso não use Daily;
- monitoramento de erros e uptime;
- armazenamento externo de arquivos, se sair do volume local.
