# Deploy no Render

Este guia configura o backend Django + PostgreSQL no Render.

## 1. Backend No Render

Use o arquivo `render.yaml` na raiz do repositório.

No Render:

1. Acesse **New > Blueprint**.
2. Conecte o repositório GitHub `afs-eng/gopsi`.
3. Selecione o arquivo `render.yaml`.
4. Confirme a criação do serviço `gopsi-api` e do banco `gopsi-postgres`.

O Render vai configurar automaticamente:

- `DATABASE_URL`
- `DJANGO_SECRET_KEY`
- `RENDER_EXTERNAL_HOSTNAME`

Revise estas variáveis no serviço `gopsi-api`:

```text
DEBUG=False
ALLOWED_HOSTS=gopsi.onrender.com
CSRF_TRUSTED_ORIGINS=https://gopsi.vercel.app
CORS_ALLOWED_ORIGINS=https://gopsi.vercel.app
CORS_ALLOWED_ORIGIN_REGEXES=^https://.*-afs-eng.vercel.app$
RUN_MIGRATIONS=true
RUN_COLLECTSTATIC=true
MFA_ISSUER=GoPsi
```

Configure também o SMTP transacional no Render. Para Brevo, use os dados de
**SMTP & API > SMTP**:

```text
DEFAULT_FROM_EMAIL=no-reply@seu-dominio.com
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_HOST_USER=seu-login-smtp-do-brevo
EMAIL_HOST_PASSWORD=sua-chave-smtp-do-brevo
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_TIMEOUT=10
```

O `DEFAULT_FROM_EMAIL` precisa ser um remetente/domínio validado no Brevo.

Se o Render gerar outro domínio, substitua os valores acima.

Health check esperado:

```text
https://gopsi.onrender.com/health/
```

## 2. Criar Ou Resetar Admin

Depois do primeiro deploy do backend, abra o **Shell** do serviço no Render.

Para criar o admin inicial:

```bash
uv run python manage.py reset_admin_password \
  --create \
  --username admin \
  --email seu-email@dominio.com \
  --password 'TroqueEssaSenha123' \
  --clear-mfa
```

Para resetar a senha depois:

```bash
uv run python manage.py reset_admin_password \
  --username admin \
  --password 'NovaSenha123' \
  --clear-mfa
```

O login aceita `username` ou e-mail.

### Sem Shell No Plano Free

Se o serviço não tiver Shell disponível, crie o admin por variáveis de ambiente
temporárias no próprio deploy.

No Render, adicione no serviço `gopsi-api`:

```text
BOOTSTRAP_ADMIN=true
ADMIN_USERNAME=admin
ADMIN_EMAIL=seu-email@dominio.com
ADMIN_PASSWORD=TroqueEssaSenha123
```

Faça um novo deploy. O entrypoint vai criar/resetar o admin automaticamente.

Depois que conseguir entrar, remova ou altere:

```text
BOOTSTRAP_ADMIN=false
ADMIN_PASSWORD=
```

Faça outro deploy para não manter senha em variável de ambiente.

## 3. Ordem Correta

1. Subir backend no Render.
2. Confirmar `/health/`.
3. Criar/resetar admin no Shell do Render.

## 4. Observações

- `RUN_MIGRATIONS=true` roda migrations em cada start do serviço. Para produção madura, troque para `false` e rode migrations manualmente antes do deploy.
- Celery/Redis ainda não estão configurados no Render por este blueprint. O backend sobe, mas filas assíncronas externas devem ser configuradas depois.
- Configure `DAILY_API_KEY` no Render antes de usar teleatendimento real.
