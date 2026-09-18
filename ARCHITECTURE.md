# Arquitetura

O projeto usa Django, Django REST Framework, PostgreSQL, Redis, Celery e Next.js.

A estrutura inicial é modular:

- `apps.accounts`: usuário customizado e papéis RBAC.
- `apps.audit`: auditoria global imutável para eventos sensíveis como login, MFA, downloads, acessos administrativos e solicitações LGPD.
- `apps.billing`: planos, assinaturas, cobranças, pagamentos e transações, preparado para gateway externo sem armazenar dados completos de cartão.
- `apps.clinics`: clínicas, vínculos de usuários e isolamento inicial por tenant.
- `apps.consents`: modelos de termos e registros de aceite com snapshot da versão aceita.
- `apps.core`: recursos transversais, incluindo health check.
- `apps.professionals`: cadastro de profissionais, especialidades e dados de atendimento.
- `apps.patients`: pacientes, responsáveis e vínculo profissional-paciente.
- `apps.privacy`: solicitações LGPD do titular para acesso, correção, portabilidade, anonimização, exclusão e revisão de consentimento.
- `apps.appointments`: agenda, consultas e bloqueios de disponibilidade.
- `apps.medical_records`: prontuário clínico, histórico versionado e auditoria.
- `apps.notifications`: modelos, fila e envio assíncrono de notificações por Celery, preparado para canais externos.
- `apps.documents`: modelos de documentos, documentos gerados e exportação em PDF.
- `apps.psychological_assessments`: avaliações psicológicas separadas do prontuário terapêutico, com sessões, instrumentos, resultados autorizados e documentos vinculados.
- `frontend/`: frontend único em Next.js consumindo `/api/v1/`.

Cada clínica é um tenant lógico. Consultas da API devem filtrar dados pelo usuário autenticado e seus vínculos ativos de clínica.

Dados de prontuário são clínicos e sensíveis. A recepção não recebe acesso automático; a fundação atual restringe leitura e escrita a superadmins e usuários com perfil profissional ativo na clínica, com histórico de versões e eventos de auditoria por alteração.

Documentos pertencem a uma clínica e podem ser vinculados a paciente, profissional e modelo. A API valida que todos os vínculos pertencem ao mesmo tenant antes de salvar. O download de PDF exige autenticação e usa o mesmo filtro de visibilidade do documento.

Avaliações psicológicas são tratadas como dados clínicos sensíveis e ficam isoladas do prontuário terapêutico. O módulo registra apenas instrumentos utilizados, sessões, sínteses/resultados autorizados e documentos gerados, sem armazenar itens, estímulos, manuais, tabelas normativas ou materiais restritos de testes psicológicos.

Consentimentos mantêm o histórico da versão efetivamente aceita. Cada aceite copia título, tipo, versão e corpo do termo para o registro, preservando evidência mesmo quando o modelo do termo for atualizado depois.
