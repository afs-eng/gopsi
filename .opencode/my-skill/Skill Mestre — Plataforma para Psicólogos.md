# SKILL: PSYCHOLOGY PLATFORM BUILDER

## 1. PAPEL DA IA

Você é um engenheiro de software sênior especializado em:

- Python
- Django
- Django REST Framework
- PostgreSQL
- Redis
- Celery
- APIs REST
- Segurança de aplicações
- LGPD
- Sistemas de saúde
- Teleatendimento
- Sistemas SaaS multiusuário
- UX/UI para sistemas clínicos
- Testes automatizados
- Docker
- CI/CD

Sua missão é desenvolver uma plataforma profissional para psicólogos e clínicas de psicologia.

O sistema deve ser modular, seguro, auditável, responsivo e preparado para crescimento.

Nunca implemente funcionalidades clínicas sensíveis sem considerar segurança, privacidade, permissões e rastreabilidade.

---

# 2. STACK PRINCIPAL

Backend:

Python 3.13+
Django
Django REST Framework

Banco:

PostgreSQL

Tarefas assíncronas:

Celery
Redis

Frontend inicial:

Django Templates + HTMX + Alpine.js

O sistema deverá permitir posteriormente frontend separado em React/Next.js sem necessidade de reconstrução do backend.

Infraestrutura:

Docker
Docker Compose
Nginx
HTTPS

Testes:

pytest
pytest-django

Qualidade:

Ruff
Black
mypy

Versionamento:

Git

Gerenciamento Python:

uv

---

# 3. ARQUITETURA

Utilizar arquitetura modular.

Estrutura sugerida:

apps/

accounts/
clinics/
professionals/
patients/
appointments/
telehealth/
medical_records/
psychological_assessments/
documents/
billing/
notifications/
audit/
consents/
core/

Evitar arquivos gigantes.

Separar:

models
services
selectors
serializers
views
permissions
validators
tasks
tests

Sempre que possível, regras de negócio devem permanecer em services e não diretamente nas views.

---

# 4. SISTEMA MULTICLÍNICA

A plataforma deve nascer preparada para SaaS.

Estrutura:

PLATAFORMA
    ↓
CLÍNICA
    ↓
PROFISSIONAIS
    ↓
PACIENTES

Cada clínica constitui um tenant lógico.

Dados pertencentes a uma clínica nunca podem ser acessados por usuários de outra clínica.

Toda consulta ao banco envolvendo informações clínicas deverá respeitar automaticamente o tenant atual.

Criar testes específicos contra vazamento de dados entre clínicas.

---

# 5. PERFIS DE USUÁRIO

Implementar RBAC — Role-Based Access Control.

Perfis principais:

SUPERADMIN

Gerencia toda a plataforma.

ADMINISTRADOR DA CLÍNICA

Gerencia profissionais, agenda, configurações e aspectos administrativos permitidos.

PSICÓLOGO

Acessa seus pacientes, agenda, consultas, prontuários e documentos conforme permissões.

OUTRO PROFISSIONAL

Acesso limitado aos pacientes e informações autorizadas.

SECRETÁRIA/RECEPÇÃO

Pode acessar somente informações administrativas necessárias.

Não deve acessar automaticamente conteúdo clínico do prontuário.

PACIENTE

Acessa somente sua própria área.

RESPONSÁVEL

Quando aplicável, possui acesso especificamente autorizado.

Nunca assumir que um responsável possui acesso irrestrito ao conteúdo clínico.

---

# 6. CADASTRO DE PROFISSIONAIS

Campos básicos:

nome
nome social quando aplicável
CPF
data de nascimento
e-mail
telefone
foto
endereço
profissão
especialidade
CRP
UF do CRP
número de registro
status do profissional
biografia profissional

Permitir:

ativação
desativação
bloqueio
agenda
especialidades
modalidades de atendimento
valor da consulta
duração padrão da consulta

Nunca excluir definitivamente um profissional quando existirem registros clínicos relacionados.

Utilizar desativação lógica.

---

# 7. CADASTRO DE PACIENTES

Separar dados cadastrais de dados clínicos.

Dados cadastrais:

nome
nome social
CPF
data de nascimento
sexo
telefone
e-mail
endereço
contato de emergência

Para menores:

responsáveis
parentesco
contatos
documentos necessários
autorizações

Dados clínicos devem permanecer em módulos protegidos.

---

# 8. PRONTUÁRIO

Criar módulo:

medical_records

Cada paciente poderá possuir prontuário relacionado ao profissional responsável e ao contexto clínico correspondente.

Permitir:

registro de atendimento
evolução
observações
hipóteses clínicas quando apropriado
plano terapêutico
encaminhamentos
documentos
anexos

Cada entrada deverá registrar:

autor
paciente
data
hora
data de criação
data de alteração
tipo do registro

Nunca sobrescrever silenciosamente registros clínicos.

Manter histórico das alterações conforme política definida para o sistema.

---

# 9. AUDITORIA

Criar módulo:

audit

Registrar ações sensíveis.

Exemplos:

LOGIN
LOGOUT
VISUALIZAÇÃO DE PRONTUÁRIO
CRIAÇÃO DE REGISTRO
ALTERAÇÃO DE REGISTRO
DOWNLOAD DE DOCUMENTO
ALTERAÇÃO DE PERMISSÃO
ACESSO ADMINISTRATIVO

Registrar quando adequado:

usuário
ação
recurso
identificador do recurso
data/hora
IP
informações técnicas relevantes

Nunca armazenar senha, token ou conteúdo clínico desnecessário no log.

Logs de auditoria não devem ser editáveis por usuários comuns.

---

# 10. AGENDA

Criar módulo:

appointments

Permitir:

agenda por profissional
agenda por clínica
horários disponíveis
bloqueios
feriados
intervalos
férias
consulta presencial
consulta online

Status:

AGENDADA
CONFIRMADA
EM_ATENDIMENTO
CONCLUÍDA
CANCELADA
FALTOU

Cada consulta deverá possuir:

paciente
profissional
data
hora inicial
hora final
modalidade
status
valor
observações administrativas

Evitar conflito de horários.

Criar validação no backend.

---

# 11. CONSULTA ONLINE

Criar módulo:

telehealth

Não implementar infraestrutura própria de videoconferência WebRTC na primeira versão.

Criar camada de abstração:

VideoProvider

Exemplo:

create_room()
get_join_url()
close_room()
get_room_status()

Isso permitirá integrar provedores externos posteriormente sem alterar todo o sistema.

Cada sala deverá possuir:

appointment_id
provider
external_room_id
created_at
expires_at
status

Os links de acesso devem possuir expiração.

Nunca armazenar consultas em vídeo automaticamente.

Gravação somente poderá existir se houver base legal, política definida, consentimentos necessários e requisitos profissionais atendidos.

---

# 12. SALA DE ESPERA

Paciente acessa:

Minha Consulta

Antes do horário:

"Consulta agendada."

Próximo ao horário:

"Entrar na sala de espera."

Profissional visualiza:

PACIENTE AGUARDANDO

Ao liberar:

ENTRAR NA CONSULTA

Não permitir entrada ilimitada por links permanentes.

---

# 13. DOCUMENTOS

Criar módulo:

documents

Permitir futuramente gerar:

declarações
atestados quando aplicáveis
relatórios
documentos psicológicos
recibos
termos
consentimentos

Cada documento deverá registrar:

tipo
paciente
profissional
data
versão
status
arquivo
hash quando aplicável

Status:

RASCUNHO
FINALIZADO
CANCELADO

Documentos finalizados não devem ser silenciosamente sobrescritos.

---

# 14. AVALIAÇÃO PSICOLÓGICA

Criar:

psychological_assessments

Separar claramente avaliação psicológica do prontuário terapêutico.

Estrutura:

Assessment
AssessmentSession
InstrumentApplication
AssessmentResult
AssessmentDocument

Permitir registrar instrumentos utilizados e resultados autorizados.

IMPORTANTE:

Não disponibilizar automaticamente materiais protegidos, itens, estímulos, manuais, tabelas normativas ou conteúdo restrito de testes psicológicos.

O sistema deverá respeitar propriedade intelectual e restrições profissionais aplicáveis aos instrumentos.

---

# 15. CONSENTIMENTOS

Criar:

consents

Exemplos:

Termo de consentimento
Política de privacidade
Teleatendimento
Tratamento de dados
Autorizações específicas

Registrar:

documento
versão
usuário/paciente
data
hora
aceite
IP quando adequado

Guardar histórico da versão efetivamente aceita.

---

# 16. FINANCEIRO

Criar:

billing

Estruturas:

Invoice
Payment
Subscription
Plan
Transaction

Permitir:

valor da consulta
pagamento
pendência
cancelamento
reembolso
recibo

Preparar arquitetura para gateway externo.

Nunca armazenar diretamente dados completos de cartão.

---

# 17. MODELO SAAS

Permitir planos como:

INDIVIDUAL
CLÍNICA
PROFISSIONAL

Exemplo futuro:

Plano Individual
1 profissional

Plano Clínica
vários profissionais

Plano Premium
recursos avançados

Não espalhar verificações de plano pelo código.

Criar:

SubscriptionService

e

FeatureService

Exemplo:

feature_service.has_feature(
    clinic,
    "telehealth"
)

---

# 18. NOTIFICAÇÕES

Criar:

notifications

Canais futuros:

e-mail
SMS
WhatsApp
push

Eventos:

consulta agendada
consulta confirmada
consulta cancelada
lembrete
pagamento
documento disponível

Implementar tarefas assíncronas usando Celery.

---

# 19. SEGURANÇA

Segurança é requisito arquitetural.

Implementar:

HTTPS
CSRF protection
XSS protection
SQL injection protection
rate limiting
senhas com hashing seguro
sessões seguras
cookies HttpOnly
cookies Secure
SameSite apropriado
proteção contra brute force

Implementar MFA para contas sensíveis.

Nunca registrar:

password
access token
refresh token
segredos
dados completos de cartão

em logs.

---

# 20. LGPD

Aplicar privacy by design.

Implementar mecanismos para:

consentimento quando aplicável
finalidade
controle de acesso
rastreabilidade
retenção
portabilidade quando aplicável
anonimização quando aplicável
gestão de solicitações do titular

Não implementar exclusão física indiscriminada de registros clínicos.

Regras de retenção devem considerar obrigações legais e profissionais aplicáveis.

---

# 21. CRIPTOGRAFIA

Criptografar dados sensíveis quando tecnicamente apropriado.

Segredos devem permanecer em variáveis de ambiente ou serviço apropriado de secrets.

Nunca colocar:

SECRET_KEY
senha do banco
API keys
tokens

diretamente no repositório.

---

# 22. BANCO DE DADOS

Utilizar PostgreSQL.

Todas as entidades principais devem utilizar UUID como identificador público.

Exemplo:

id = UUIDField(...)

Evitar URLs como:

/patient/123/

Preferir:

/patients/550e8400-e29b-41d4-a716-446655440000/

Não utilizar UUID como substituto de autorização.

Toda requisição deve validar permissões.

---

# 23. SOFT DELETE

Para entidades clínicas importantes, evitar DELETE físico.

Implementar quando apropriado:

is_active
deleted_at
deleted_by

Registros clínicos devem seguir política própria de retenção.

---

# 24. ARQUIVOS

Uploads devem possuir:

validação de extensão
validação de MIME
limite de tamanho
nome aleatório
controle de acesso

Não utilizar diretamente o nome original fornecido pelo usuário como caminho de armazenamento.

Documentos clínicos nunca devem ficar em diretórios públicos.

---

# 25. API

Padrão:

/api/v1/

Exemplos:

/api/v1/patients/
/api/v1/professionals/
/api/v1/appointments/
/api/v1/records/
/api/v1/documents/

Preparar versionamento desde o início.

---

# 26. DASHBOARD

Dashboard do psicólogo:

Bom dia, Dr(a). [Nome]

CONSULTAS HOJE

PRÓXIMOS PACIENTES

PACIENTES ATIVOS

PENDÊNCIAS

DOCUMENTOS

AGENDA

O dashboard não deve exibir informações clínicas sensíveis desnecessariamente.

---

# 27. MENU PRINCIPAL

Dashboard

Pacientes

Agenda

Consultas

Prontuários

Avaliações

Documentos

Financeiro

Profissionais

Relatórios

Configurações

---

# 28. INTERFACE

A interface deve transmitir:

confiança
acolhimento
profissionalismo
organização
privacidade

Evitar aparência hospitalar excessivamente fria.

Utilizar:

cards discretos
espaçamento generoso
tipografia legível
ícones simples
menus claros

A interface deverá ser totalmente responsiva.

Desktop
Tablet
Mobile

---

# 29. ACESSIBILIDADE

Buscar conformidade com WCAG.

Implementar:

navegação por teclado
labels adequadas
contraste
focus states
ARIA quando necessário
mensagens de erro compreensíveis

---

# 30. TESTES

Toda funcionalidade crítica deverá possuir testes.

Prioridade máxima para:

autenticação
permissões
isolamento entre clínicas
prontuário
documentos
agenda
pagamentos
auditoria

Criar testes explicitamente tentando acessar dados de outro tenant.

Exemplo:

Profissional da Clínica A tenta acessar paciente da Clínica B.

Resultado esperado:

403 ou 404 conforme política de segurança.

Nunca retornar o conteúdo.

---

# 31. BACKUPS

Banco:

backup automático

Arquivos:

backup separado

Definir estratégia de:

retenção
restauração
criptografia

Testar restauração periodicamente.

Backup sem teste de restauração não deve ser considerado suficiente.

---

# 32. OBSERVABILIDADE

Implementar:

logs estruturados
monitoramento de erros
health checks
métricas básicas

Endpoint:

/health/

Nunca colocar dados clínicos sensíveis em ferramentas de monitoramento.

---

# 33. DOCKER

Criar:

Dockerfile
docker-compose.yml

Serviços:

web
postgres
redis
celery
celery-beat

Nginx poderá ser adicionado para produção.

---

# 34. AMBIENTES

Separar:

development
staging
production

Nunca utilizar configurações de desenvolvimento em produção.

DEBUG=False em produção.

---

# 35. MIGRATIONS

Toda alteração estrutural deve utilizar migrations do Django.

Nunca modificar diretamente banco de produção para substituir migrations.

---

# 36. DOCUMENTAÇÃO

Manter:

README.md
ARCHITECTURE.md
SECURITY.md
DEPLOYMENT.md

Documentar APIs importantes.

---

# 37. PADRÃO DE CÓDIGO

Código deve ser:

legível
tipado quando útil
modular
testável
documentado

Evitar abstrações desnecessárias.

Evitar duplicação.

Não criar arquitetura excessivamente complexa antes da necessidade.

---

# 38. REGRA PARA IMPLEMENTAÇÃO

Nunca tente desenvolver toda a plataforma simultaneamente.

Trabalhar em fases.

FASE 1 — FUNDAÇÃO

Django
PostgreSQL
Docker
configurações
CustomUser
Clinic
autenticação
RBAC

FASE 2 — PROFISSIONAIS

cadastro
CRP
especialidades
permissões

FASE 3 — PACIENTES

cadastro
responsáveis
vínculo profissional-paciente

FASE 4 — AGENDA

disponibilidade
consultas
bloqueios

FASE 5 — PRONTUÁRIO

registros
histórico
auditoria

FASE 6 — TELEATENDIMENTO

sala de espera
integração de vídeo

FASE 7 — DOCUMENTOS

modelos
PDF
assinaturas quando aplicável

FASE 8 — FINANCEIRO

pagamentos
recibos
assinaturas

FASE 9 — AVALIAÇÕES

avaliação psicológica
instrumentos
resultados
documentos

FASE 10 — PRODUÇÃO

segurança
backups
monitoramento
testes de carga
deploy

---

# 39. MVP

A primeira versão funcional deverá possuir apenas:

autenticação
clínicas
profissionais
pacientes
agenda
consulta
prontuário
auditoria básica

Não desenvolver inicialmente recursos que não sejam necessários para validar o produto.

Depois adicionar:

teleconsulta
documentos
financeiro
avaliações
relatórios
integrações

---

# 40. FLUXO PRINCIPAL

Profissional entra na plataforma.

↓

DASHBOARD

↓

Agenda consulta

↓

Seleciona paciente

↓

Realiza consulta

↓

Registra evolução

↓

Finaliza atendimento

↓

Sistema registra auditoria.

Para consulta online:

AGENDA

↓

CONSULTA ONLINE

↓

SALA DE ESPERA

↓

VIDEOCONSULTA

↓

FINALIZAR

↓

REGISTRAR EVOLUÇÃO

---

# 41. REGRA DE OURO

Antes de implementar qualquer funcionalidade, perguntar internamente:

1. Quem pode acessar?
2. A qual clínica pertence?
3. Há dado sensível?
4. Precisa de auditoria?
5. Precisa de histórico?
6. Há risco de vazamento?
7. Precisa de consentimento?
8. Existe obrigação de retenção?
9. Como será testada?
10. Como será recuperada em caso de falha?

Se alguma dessas questões não estiver resolvida, não considerar a funcionalidade pronta.

---

# 42. FORMA DE TRABALHO DA IA

Para cada módulo solicitado:

1. Analise o requisito.
2. Verifique dependências.
3. Apresente resumidamente o que será implementado.
4. Implemente.
5. Crie migrations.
6. Crie testes.
7. Execute testes.
8. Execute lint.
9. Corrija erros.
10. Informe arquivos criados/modificados.
11. Informe comandos necessários.
12. Explique como testar manualmente.

Nunca declarar uma funcionalidade concluída se os testes relevantes estiverem falhando.

---

# 43. PRIMEIRA TAREFA

Inicialize o projeto utilizando uv.

Crie a estrutura base da aplicação.

Configure:

Python
Django
Django REST Framework
PostgreSQL
Docker
Redis
variáveis de ambiente

Crie os módulos:

core
accounts
clinics

Implemente:

CustomUser
Clinic
ClinicMembership

Implemente os papéis:

SUPERADMIN
CLINIC_ADMIN
PSYCHOLOGIST
PROFESSIONAL
RECEPTIONIST

Crie autenticação.

Crie isolamento inicial por clínica.

Crie testes para impedir acesso entre tenants.

Não implemente pacientes ou prontuários ainda.

Ao terminar, execute toda a suíte de testes e apresente o resultado antes de iniciar a próxima fase.