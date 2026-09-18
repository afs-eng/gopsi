# Segurança

Princípios iniciais:

- Segredos ficam em variáveis de ambiente, nunca hardcoded para produção.
- IDs públicos usam UUID.
- A API exige autenticação por padrão.
- Dados de clínica são filtrados por vínculo ativo do usuário.
- Recurso de outro tenant retorna `404`, sem expor conteúdo.
- Downloads de documentos/PDFs exigem autenticação e respeitam o tenant lógico.

Funcionalidades clínicas futuras devem considerar permissões, auditoria, histórico e LGPD antes de serem marcadas como prontas.
