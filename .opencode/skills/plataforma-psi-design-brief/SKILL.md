---
name: plataforma-psi-design-brief
description: Use when preparing a design brief, UI/UX direction, Figma request, redesign scope, or product context for Plataforma PSI, a SaaS for psychologists and clinics.
---

# Plataforma PSI Design Brief

Use esta skill quando precisar explicar a Plataforma PSI para um designer, gerar um briefing de redesign, pedir telas no Figma, revisar propostas visuais ou orientar a implementação de UI/UX do produto.

## Produto

Plataforma PSI é um SaaS para psicólogos, clínicas e equipes administrativas de saúde mental.

O produto centraliza a operação clínica e administrativa:

- gestão de clínicas
- profissionais
- pacientes
- agenda
- bloqueios de horário
- prontuário clínico
- teleatendimento
- documentos e PDFs
- consentimentos
- avaliações psicológicas
- financeiro
- notificações
- auditoria
- MFA
- solicitações LGPD
- relatórios
- configurações

O produto lida com dados sensíveis de saúde. A interface deve transmitir segurança, privacidade, organização e profissionalismo, sem parecer hospitalar fria ou genérica demais.

## Público-Alvo

Usuários principais:

- Psicólogo autônomo que gerencia sua própria agenda, pacientes, prontuários, documentos e pagamentos.
- Clínica pequena ou média com múltiplos profissionais.
- Recepção/administrativo que agenda consultas, gerencia pacientes, cobranças e documentos permitidos.
- Gestor da clínica que acompanha operação, financeiro, equipe e relatórios.
- Paciente que acessa links públicos de teleatendimento, documentos ou consentimentos.

Perfis e privacidade:

- Profissionais podem acessar dados clínicos dos seus pacientes.
- Recepção não deve ver conteúdo clínico sensível por padrão.
- Gestores precisam de visão operacional, mas não necessariamente de detalhes terapêuticos.
- Pacientes devem ver apenas informações simples, acolhedoras e estritamente necessárias.

## Objetivo Do Redesign

Criar uma interface mais bonita, madura e funcional para a Plataforma PSI.

O redesign deve melhorar:

- clareza visual
- navegação entre módulos
- hierarquia de informação
- densidade das telas
- confiança e privacidade percebida
- uso diário por profissionais de saúde
- responsividade desktop e mobile
- acessibilidade

Evitar:

- botões grandes demais
- excesso de arredondamento
- cores saturadas ou muito chamativas
- gradientes exagerados
- aparência genérica de dashboard SaaS
- layout infantilizado
- login com visual pesado ou promocional demais
- telas com cards enormes e pouca informação útil
- paredes de dados clínicos no dashboard

## Direção Visual Preferida

O visual deve ser sóbrio, claro e profissional.

Paleta sugerida:

- fundo principal: branco quente, areia clara ou cinza quente muito leve
- texto principal: grafite esverdeado ou quase preto suave
- cor primária: verde petróleo, teal escuro ou azul-petróleo discreto
- cor secundária: cinza quente, bege, azul acinzentado ou verde muito claro
- alertas: tons discretos de âmbar, vermelho queimado e azul informativo

Sensação desejada:

- confiável
- calma
- organizada
- segura
- clínica
- moderna sem parecer startup genérica
- acolhedora sem perder seriedade

Componentes:

- botões compactos, aproximadamente 36px a 42px de altura no desktop
- inputs claros, com labels visíveis
- tabelas legíveis e mais densas
- cards com bordas discretas e sombra mínima
- navegação lateral ou superior bem objetiva
- estados vazios úteis com uma ação principal
- badges pequenos e legíveis
- ícones apenas como apoio, nunca como única informação

## Login

A tela de login precisa ser refeita com prioridade alta.

Problemas a evitar:

- painel visual grande demais
- bloco escuro dominante
- copy institucional em excesso
- botão enorme
- layout com cara de landing page

Direção desejada:

- tela limpa e centrada
- formulário como foco principal
- marca discreta
- campos de e-mail e senha bem legíveis
- botão primário compacto
- mensagens de segurança discretas
- opção de MFA quando necessário
- visual profissional e direto

Conteúdo sugerido:

- título: "Entrar"
- subtítulo: "Acesse sua conta profissional."
- campos: E-mail, Senha
- ação primária: "Entrar"
- links secundários: "Esqueci minha senha" e, se aplicável, "Usar código MFA"
- nota discreta: "Ambiente seguro para dados clínicos."

## Estrutura De Navegação

Módulos principais:

- Painel
- Agenda
- Pacientes
- Profissionais
- Prontuários
- Documentos
- Teleatendimento
- Financeiro
- Relatórios
- Configurações

O contexto da clínica selecionada deve estar sempre visível nas telas internas.

Evitar expor UUIDs ou termos técnicos para usuários finais.

## Telas Obrigatórias Para O Designer

O designer deve projetar pelo menos estas telas ou famílias de telas:

- Login
- Painel inicial da clínica
- Lista de clínicas
- Nova clínica
- Detalhe da clínica
- Lista de pacientes
- Novo paciente
- Detalhe do paciente
- Lista de profissionais
- Novo profissional
- Agenda diária/semanal
- Nova consulta
- Bloqueio de horário
- Prontuário/lista de registros
- Novo registro de prontuário
- Documentos/modelos
- Novo documento ou modelo
- Financeiro: planos, faturas, pagamentos e transações
- Teleatendimento: lista de sessões
- Sala de teleatendimento profissional
- Entrada pública do paciente para teleatendimento
- Relatórios
- Configurações da clínica
- Estados vazios
- Estados de erro
- Estados de carregamento
- Estados sem permissão
- Mobile das telas principais

## Dashboard

O dashboard deve ser operacional, não decorativo.

Deve mostrar:

- agenda do dia
- próximos atendimentos
- pendências importantes
- avisos de consentimento/documentos
- indicadores financeiros básicos, se permitido
- ações rápidas úteis

Não deve mostrar por padrão:

- notas clínicas sensíveis
- hipóteses diagnósticas
- detalhes de prontuário
- informações íntimas do paciente
- dados administrativos irrelevantes

## Agenda

A agenda é uma tela central do produto.

Deve permitir:

- alternar entre dia, semana e lista
- identificar atendimento presencial, online e bloqueio
- visualizar profissional responsável
- criar consulta rapidamente
- criar bloqueio de horário
- acessar paciente ou sessão com poucos cliques
- funcionar bem em mobile

Visualmente, precisa ser densa o suficiente para uso real em clínica, sem parecer planilha confusa.

## Pacientes

A área de pacientes deve ser organizada e cuidadosa com privacidade.

Lista de pacientes:

- busca clara
- filtros por status, profissional e próxima consulta
- status visível
- última ou próxima consulta, se permitido
- ações compactas

Detalhe do paciente:

- dados cadastrais
- responsáveis, quando houver
- próximos atendimentos
- documentos vinculados
- consentimentos
- acesso ao prontuário apenas para perfis autorizados

## Prontuário

Prontuário é área sensível.

Regras de design:

- sinalizar que o conteúdo é privado
- mostrar autoria e data de cada registro
- evitar exposição desnecessária no dashboard
- separar histórico, anexos e auditoria
- deixar claro quando um registro foi salvo, alterado ou bloqueado
- ações destrutivas devem ter confirmação

## Documentos E Consentimentos

Documentos precisam parecer formais e confiáveis.

Projetar:

- lista de documentos
- modelos
- status: rascunho, gerado, assinado, expirado, revogado
- download de PDF
- vínculo com paciente/profissional
- tela de consentimento com linguagem clara para paciente

## Teleatendimento

Separar experiência profissional e paciente.

Profissional:

- lista de sessões
- status da sala
- link de acesso
- controles de entrada
- informação do paciente e horário

Paciente:

- página simples
- confirmar nome
- data e horário
- nome do profissional
- botão único: "Entrar na consulta"
- estado de espera
- estado expirado/cancelado/finalizado com explicação clara

Não usar termos como tenant, UUID, token, provider ou session para paciente.

## Financeiro

Financeiro deve ser claro e objetivo.

Projetar:

- planos
- assinatura ativa
- faturas
- pagamentos
- transações
- status de pagamento
- valores em destaque moderado
- avisos de pendência sem tom alarmista

Não solicitar ou exibir dados completos de cartão.

## Relatórios

Relatórios devem priorizar leitura rápida.

Possíveis indicadores:

- consultas realizadas
- faltas/cancelamentos
- ocupação da agenda
- receita recebida e pendente
- novos pacientes
- documentos pendentes

Evitar gráficos decorativos sem utilidade.

## Acessibilidade

Requisitos mínimos:

- contraste adequado
- fonte legível
- labels sempre visíveis em formulários
- foco de teclado claro
- áreas clicáveis confortáveis
- mensagens de erro junto ao campo
- não depender só de cor para status
- textos simples e específicos

## Entregáveis Esperados Do Designer

Solicitar ao designer:

- design system básico no Figma
- tokens de cor
- tipografia
- espaçamentos
- componentes principais
- botões, inputs, selects, textarea, badges, tabs, cards, tabelas, modais e toasts
- navegação desktop e mobile
- protótipo clicável dos fluxos principais
- telas desktop principais
- telas mobile principais
- estados vazios, loading, erro, sucesso e sem permissão
- especificação de comportamento responsivo

## Critérios De Aprovação

Uma proposta boa deve responder "sim" para estas perguntas:

- A tela de login parece profissional e simples?
- Os botões estão proporcionais ao resto da interface?
- A paleta passa confiança sem ser pesada?
- A agenda seria usável por uma clínica real?
- Pacientes e prontuários respeitam privacidade?
- A recepção consegue operar sem ver conteúdo clínico indevido?
- O dashboard ajuda no dia a dia ou só decora?
- O mobile preserva as tarefas principais?
- Os estados vazios orientam o usuário?
- A interface parece de saúde mental sem parecer hospitalar fria?

## Prompt Pronto Para Enviar Ao Designer

Use este texto como ponto de partida:

```text
Preciso de um redesign completo para a Plataforma PSI, um SaaS para psicólogos e clínicas de psicologia.

A plataforma tem módulos de clínicas, profissionais, pacientes, agenda, prontuário, teleatendimento, documentos, consentimentos, avaliações psicológicas, financeiro, notificações, auditoria, MFA, LGPD, relatórios e configurações.

O visual atual não agrada. Quero evitar botões grandes demais, cores saturadas, gradientes exagerados, cards enormes e uma tela de login com aparência promocional. A nova interface deve ser mais sóbria, profissional, clara, segura e adequada para saúde mental.

Direção visual desejada: branco quente/cinza quente como base, cor primária em verde petróleo ou azul-petróleo discreto, texto grafite, bordas sutis, pouca sombra, botões compactos, tabelas legíveis, formulários com labels claros e boa densidade de informação.

Preciso que você projete no Figma: login, dashboard, clínicas, pacientes, profissionais, agenda, prontuário, documentos, consentimentos, teleatendimento profissional, entrada pública do paciente, financeiro, relatórios, configurações, estados vazios, loading, erro, sucesso, sem permissão e versões mobile das telas principais.

Como o sistema lida com dados clínicos sensíveis, a interface deve priorizar privacidade, hierarquia clara, acessibilidade e controle de permissões. A recepção não deve ver conteúdo clínico sensível por padrão. Pacientes não devem ver termos técnicos como UUID, token, tenant ou session.

Entregáveis esperados: design system básico, tokens de cor, tipografia, componentes, navegação desktop/mobile, protótipo clicável e especificação responsiva.
```

## Notas Para Implementação Frontend

O repositório não contém frontend: o app web foi removido e o projeto expõe apenas a API Django (`/api/v1/`) e o admin. Trabalhos de UI devem ser produzidos em Figma/especificação, sem comandos de build local.

Ao especificar o design, preservar as regras de privacidade por papel e evitar expor dados clínicos em telas de resumo.
