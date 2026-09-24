# Plataforma PSI

Fundação de uma plataforma SaaS para psicólogos e clínicas, seguindo a Fase 1 da skill do projeto.

Fases implementadas até aqui: fundação, profissionais, pacientes, agenda, prontuário, teleatendimento, documentos, avaliações psicológicas, consentimentos, financeiro, notificações, auditoria global, MFA e solicitações LGPD.

## Desenvolvimento

1. Instale dependências: `uv sync --python /usr/bin/python3.14`
2. Copie `.env.example` para `.env` e ajuste os valores locais.
3. Suba dependências: `docker compose up postgres redis`
4. Rode migrations: `uv run python manage.py migrate`
5. Inicie o backend: `uv run python manage.py runserver`

Com Docker, use `docker compose up` e acesse a API em `http://localhost:8000`.

## Endpoints iniciais

- `GET /health/`
- `POST /api/v1/auth/login/`
- `GET /api/v1/auth/me/`
- `POST /api/v1/auth/password-reset/request/`
- `POST /api/v1/auth/password-reset/confirm/`
- `POST /api/v1/auth/mfa/setup/`
- `POST /api/v1/auth/mfa/confirm/`
- `POST /api/v1/auth/mfa/disable/`
- `GET /api/v1/audit/?clinic={uuid}`
- `GET /api/v1/privacy/requests/?clinic={uuid}`
- `POST /api/v1/privacy/requests/`
- `GET /api/v1/billing/plans/`
- `GET /api/v1/billing/subscriptions/?clinic={uuid}`
- `POST /api/v1/billing/subscriptions/`
- `GET /api/v1/billing/invoices/?clinic={uuid}`
- `POST /api/v1/billing/invoices/`
- `GET /api/v1/billing/payments/?clinic={uuid}`
- `POST /api/v1/billing/payments/`
- `GET /api/v1/billing/transactions/?clinic={uuid}`
- `GET /api/v1/clinics/`
- `GET /api/v1/clinics/{uuid}/`
- `GET /api/v1/professionals/?clinic={uuid}`
- `GET /api/v1/patients/?clinic={uuid}`
- `GET /api/v1/appointments/?clinic={uuid}`
- `GET /api/v1/appointments/blocks/?clinic={uuid}`
- `GET /api/v1/medical-records/?clinic={uuid}`
- `GET /api/v1/medical-records/audit/?clinic={uuid}`
- `GET /api/v1/notifications/templates/?clinic={uuid}`
- `POST /api/v1/notifications/templates/`
- `GET /api/v1/notifications/?clinic={uuid}`
- `POST /api/v1/notifications/`
- `POST /api/v1/notifications/{uuid}/queue/`
- `POST /api/v1/notifications/{uuid}/send/`
- `GET /api/v1/documents/templates/?clinic={uuid}`
- `POST /api/v1/documents/templates/`
- `GET /api/v1/documents/?clinic={uuid}`
- `POST /api/v1/documents/`
- `GET /api/v1/documents/{uuid}/pdf/`
- `GET /api/v1/consents/templates/?clinic={uuid}`
- `POST /api/v1/consents/templates/`
- `GET /api/v1/consents/?clinic={uuid}`
- `POST /api/v1/consents/`
- `POST /api/v1/consents/{uuid}/revoke/`
- `GET /api/v1/psychological-assessments/?clinic={uuid}`
- `POST /api/v1/psychological-assessments/`
- `GET /api/v1/psychological-assessments/sessions/`
- `GET /api/v1/psychological-assessments/instruments/`
- `GET /api/v1/psychological-assessments/results/`
- `GET /api/v1/psychological-assessments/documents/`

## Qualidade

- Testes: `uv run pytest`
- Lint: `uv run ruff check .`
- Format: `uv run black .`
