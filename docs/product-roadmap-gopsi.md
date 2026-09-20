# Roadmap Comercial GoPsi

## Posicionamento

GoPsi deve ser apresentada como uma plataforma de gestão clínica e avaliação psicológica em um só lugar.

Proposta central:

```text
GoPsi — gestão clínica e avaliação psicológica em um só lugar.
```

Variação comercial:

```text
Agenda, prontuário, documentos e avaliação psicológica em uma plataforma segura para psicólogos e clínicas.
```

O produto não deve ser vendido apenas como sistema de prontuário ou agenda. O diferencial comercial é unir a operação clínica diária com um fluxo estruturado de avaliação psicológica/neuropsicológica.

## MVP Comercial

A primeira versão vendável deve priorizar seis pilares:

1. Pacientes
2. Agenda
3. Prontuário
4. Documentos/PDF
5. Financeiro básico
6. Avaliação psicológica

Esses módulos já compõem valor suficiente para psicólogos e clínicas perceberem utilidade e pagarem mensalidade.

## Diferencial Principal

A área de Avaliação Psicológica deve ter fluxo próprio:

```text
Paciente -> Avaliação -> Instrumentos aplicados -> Resultados -> Tabelas/Gráficos -> Interpretação -> Síntese integrativa -> Documento final
```

O sistema deve permitir:

- cadastrar avaliações vinculadas a paciente e profissional;
- registrar instrumentos aplicados;
- lançar resultados, classificações e observações;
- acompanhar avaliações em andamento;
- criar síntese integrativa;
- gerar relatório, laudo, parecer ou devolutiva a partir da avaliação;
- usar IA apenas como apoio de organização e redação técnica, sem substituir a interpretação nem a responsabilidade profissional.

## Prioridade De Produto

1. Melhorar dashboard operacional.
2. Criar ou fortalecer detalhe do paciente com abas.
3. Conectar paciente, agenda, prontuário, documentos, financeiro e avaliação.
4. Melhorar agenda com status e ações clínicas.
5. Melhorar prontuário com tipos de registro e proteção contra alteração indevida.
6. Melhorar documentos com modelos e PDF mais profissional.
7. Evoluir Avaliação Psicológica como diferencial comercial.
8. Depois adicionar WhatsApp, cobrança online, assinatura digital, IA avançada, escalas, supervisão e app.

## Fluxos Que Precisam Parecer Completos

Fluxo clínico diário:

```text
Criar paciente -> agendar sessão -> realizar sessão -> registrar evolução -> gerar documento -> marcar pagamento
```

Fluxo de avaliação psicológica:

```text
Criar paciente -> iniciar avaliação -> lançar instrumentos -> registrar resultados -> montar síntese -> gerar relatório
```

## Regras De Segurança E LGPD

- Dashboard não deve expor conteúdo clínico sensível por padrão.
- Recepção não deve ver prontuário, hipóteses, evolução ou interpretação psicológica sem permissão adequada.
- Pacientes não devem ver termos técnicos como UUID, tenant, token, provider ou session.
- Redefinição de senha não deve redefinir MFA automaticamente.
- MFA só deve ser limpo em perda de autenticador, suspeita de comprometimento ou recuperação administrativa.
- Prontuário e documentos devem exibir autoria, data e trilha de alteração quando aplicável.

## Pacotes De Evolução

### Pacote 1

- Dashboard mais comercial e operacional.
- Pacientes com busca, filtros e ações rápidas.
- Remover termos técnicos da interface.
- Destacar Avaliação Psicológica como diferencial do produto.

### Pacote 2

- Detalhe do paciente com abas: Resumo, Agenda, Prontuário, Documentos, Financeiro e Avaliações.
- Ações contextuais partindo do paciente.
- Indicadores de próximos atendimentos, documentos e pendências.

### Pacote 3

- Frontend completo para Avaliação Psicológica.
- Instrumentos, resultados, interpretação, síntese e documento final.
- Relatórios de avaliação com status e histórico.
