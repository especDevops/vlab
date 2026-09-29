# VLab - Biblioteca Virtual 💻📖

Interface Web Single Page Application (SPA) e ecossistema integrado para a plataforma **Biblioteca Virtual**, construída com React 19, TypeScript, Vite e orquestrada com Docker Compose e GitHub Actions.

---

## 1. Visão Geral

- **Nome do Projeto:** VLab - Biblioteca Virtual
- **Problema que Resolve:** Gerenciamento centralizado do acervo de livros de uma biblioteca (cadastro, listagem, edição e exclusão), fornecendo interface web moderna e reativa conectada a uma API segura com controle de acesso baseado em perfis (ADMIN e PADRAO).
- **Principais Tecnologias:**
  - **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 8](https://vitejs.dev/), [Axios](https://axios-http.com/), [Tailwind CSS](https://tailwindcss.com/), Nginx 1.27 Alpine (executado como usuário não-root).
  - **Backend API:** [Java 21/25](https://www.oracle.com/java/), [Spring Boot 4.1](https://spring.io/projects/spring-boot), Spring Data JPA, Spring Security (OAuth2 Resource Server + JWT), Spring Boot Actuator, MapStruct, Lombok.
  - **Banco de Dados:** [PostgreSQL 16](https://www.postgresql.org/) (em contêiner com persistência em volume nomeado) e H2 Database (perfil de testes automatizados).
  - **DevOps & Qualidade:** Docker, Docker Compose, GitHub Actions, Docker Hub, SonarQube Cloud, GitHub CodeQL.

---

## 2. Arquitetura

Diagrama de comunicação e topologia entre os componentes da plataforma:

```text
+-------------------------------------------------------------------------------+
|                             CLIENTE / NAVEGADOR                               |
|                     Interface Web: http://localhost:5173                      |
+-------------------------------------------------------------------------------+
                                         |
                                         | Requisições HTTP REST
                                         v
+-------------------------------------------------------------------------------+
|                            REDE DOCKER COMPOSE                                |
|                                                                               |
|   +-----------------------------+           +-----------------------------+   |
|   |   frontend (vlab)           |           |   backend                   |   |
|   |   Servidor: Nginx 1.27      |           |   Spring Boot 4.1 (Java)    |   |
|   |   Porta: 5173 -> 8080       |           |   Porta Interna/Host: 8080  |   |
|   |   Usuário: nginx (não-root) |           |   Usuário: appuser (non-root|   |
|   |   Healthcheck: GET /        |           |   Healthcheck: /actuator    |   |
|   +-----------------------------+           +-----------------------------+   |
|                                                            |                  |
|                                                            | JDBC / TCP:5432  |
|                                                            v                  |
|                                             +-----------------------------+   |
|                                             |   db (PostgreSQL 16 Alpine) |   |
|                                             |   Porta: 5432               |   |
|                                             |   Healthcheck: pg_isready   |   |
|                                             |   Volume: biblioteca_db_data|   |
|                                             +-----------------------------+   |
+-------------------------------------------------------------------------------+
```

---

## 3. Como Rodar Localmente (Sem Docker)

### Pré-requisitos
- **Node.js:** Versão 20.x ou superior (testado no Node 24).
- **NPM:** Versão 10.x ou superior.
- **Backend da Biblioteca:** Instância da API ativa na porta `8080`.

### Execução da Interface
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (HMR ativo)
npm run dev
```
A interface estará disponível em: `http://localhost:5173`.

---

## 4. Como Rodar com Docker Compose

O arquivo `docker-compose.yml` permite subir frontend, backend e banco de dados PostgreSQL com um único comando:

### Comandos de Execução
```bash
# 1. Copiar variáveis a partir do exemplo (valores padrão já configurados)
cp .env.example .env

# 2. Subir toda a stack em segundo plano
docker compose up --build -d
```

### URLs de Acesso
- **Frontend Web:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8080/livros](http://localhost:8080/livros)
- **Healthcheck Actuator:** [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- **Banco de Dados PostgreSQL:** `localhost:5432`

---

## 5. Como Rodar a Partir da Imagem Publicada

Para executar a aplicação utilizando diretamente as imagens publicadas no Docker Hub pelo pipeline de Entrega Contínua (CD), sem compilar o código localmente:

```bash
# 1. Baixar as imagens publicadas no Docker Hub
docker pull especdevops/vlab:latest
docker pull especdevops/biblioteca-backend:latest

# 2. Subir a stack utilizando o Compose de produção
docker compose -f docker-compose.prod.yml up -d
```

---

## 6. Como Rodar os Testes

Execução dos testes e verificação de qualidade de código:

### Testes Automatizados (Vitest)
```bash
npm test -- --run
```

### Verificação de Linter (Oxlint)
```bash
npm run lint
```

### Relatório de Cobertura
```bash
npm run test:coverage
```

---

## 7. Pipeline CI/CD

O workflow [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) gerencia todo o ciclo de vida da aplicação:

- **Etapa de CI (`validate`):**
  - Executa a cada `push` e `pull_request` para a branch `main`.
  - Instala dependências e roda **Oxlint**.
  - Executa a suíte de testes com cobertura (**Vitest** e **JUnit 5** no backend).
  - Valida a compilação das imagens Docker (`docker build`).
- **Análise de Qualidade e Segurança:**
  - SAST com **GitHub CodeQL** para JavaScript/TypeScript.
  - Quality Gate com **SonarQube Cloud**.
- **Etapa de CD (`publish-images`):**
  - Disparada automaticamente após sucesso de todas as etapas de CI (`needs: [validate, codeql, sonarqube]`) e restrita à branch `main`.
  - Autentica no Docker Hub com `DOCKERHUB_USERNAME` e `DOCKERHUB_TOKEN`.
  - Publica as imagens `vlab` e `biblioteca-backend` tagueadas com `${{ github.sha }}` e `latest`.
- **Deploy Local (`deploy-local`):**
  - O runner self-hosted atualiza a stack local utilizando as imagens publicadas com a tag do SHA do commit.
- **Histórico e Execuções:**
  - Visualize o status na aba [Actions do Repositório](https://github.com/especDevops/vlab/actions).

---

## 8. Variáveis de Ambiente

As variáveis de configuração do ambiente estão no arquivo `.env` (baseado no `.env.example` versionado):

| Variável | Descrição / Para que serve | Valor de Exemplo |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL base consumida pelo frontend para requisitar a API | `http://localhost:8080` |
| `POSTGRES_USER` | Usuário do banco de dados PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Senha de acesso ao banco PostgreSQL | `postgres_dev_password` |
| `POSTGRES_DB` | Nome da base de dados relacional | `biblioteca` |
| `SPRING_DATASOURCE_URL` | URL de conexão JDBC utilizada pelo Spring Boot | `jdbc:postgresql://db:5432/biblioteca` |
| `JWT_SECRET` | Chave secreta de assinatura e validação dos tokens JWT | `FEÇD58D4531F5827E82374S5WD51Ç72D` |
| `WEB_ORIGENS_PERMITIDAS` | Origens autorizadas para requisições no CORS da API | `http://localhost:5173,http://127.0.0.1:5173` |
| `DOCKERHUB_USERNAME` | Namespace da organização no Docker Hub para imagens | `especdevops` |
| `IMAGE_TAG` | Tag da imagem utilizada para deploy no Docker Compose | `latest` ou `${{ github.sha }}` |

---

## 9. Uso de IA

Conforme diretriz técnica da disciplina (*"toda saída de IA é hipótese até ser validada por teste, execução ou revisão humana"*), segue o registro das interações com ferramentas de IA durante o projeto:

- **O que foi solicitado à IA:**
  1. Criação do esqueleto inicial dos Dockerfiles multi-stage para frontend (Node + Nginx) e backend (Java + Temurin).
  2. Elaboração do pipeline unificado de CI/CD para GitHub Actions com integração ao Docker Hub e SonarQube.
  3. Configuração do arquivo `docker-compose.yml` para orquestração de banco PostgreSQL, API e Frontend.
- **O que foi aceito da IA:**
  1. Estratégia de multi-stage build aproveitando o cache de dependências de `package.json` e `pom.xml`.
  2. Configuração de healthcheck do PostgreSQL via `pg_isready` e volume nomeado `biblioteca_db_data`.
  3. Encadeamento estrito de jobs com `needs: [validate, codeql, sonarqube]` para impedir que código sem validação seja publicado no registry.
- **O que foi rejeitado ou corrigido pela equipe humana:**
  1. *Execução como Root no Nginx:* A IA propôs imagem padrão rodando como root na porta 80. A equipe corrigiu para `USER nginx`, configurou a porta não-root `8080`, corrigiu o caminho de PID para `/tmp/nginx.pid` e aplicou permissões estritas via `chown`.
  2. *Mascaramento de Erros:* A IA havia incluído `|| true` no passo de download de dependências do Maven. A equipe removeu a flag para garantir que falhas reais quebrem o build.
  3. *Versão da Imagem Base:* A IA sugeriu `nginx:alpine` sem tag específica. A equipe corrigiu para `nginx:1.27-alpine` para manter build determinístico e reprodutível.
  4. *Sincronização de Containers:* Ajustada a diretiva `depends_on: { condition: service_healthy }` para evitar que o frontend ou a API inicializassem antes do banco estar apto para conexões.

---

## 10. Troubleshooting

Problemas práticos encontrados pela equipe durante o desenvolvimento e como solucioná-los:

### 1. Frontend acusa erro de rede ou CORS ao chamar a API
- **Sintoma:** Interface web carrega, mas os livros não aparecem e o console exibe `Network Error` ou erro de política CORS.
- **Causa:** O backend ainda não concluiu a inicialização ou a variável `WEB_ORIGENS_PERMITIDAS` não contém a origem do frontend.
- **Solução:**
  1. Verifique o status da API via `docker compose ps` e logs via `docker compose logs -f backend`.
  2. Garanta que `WEB_ORIGENS_PERMITIDAS` contenha `http://localhost:5173`.
  3. Teste o endpoint de saúde: `curl http://localhost:8080/actuator/health`.

### 2. Conflito de porta local (`Port 5173 or 8080 already in use`)
- **Sintoma:** O comando `docker compose up` falha ao tentar vincular as portas no host.
- **Causa:** Processos antigos do Node, Java ou outro contêiner continuam em execução no sistema operacional.
- **Solução (PowerShell no Windows):**
  ```powershell
  # Localizar e encerrar processo ocupando a porta
  Get-NetTCPConnection -LocalPort 5173,8080 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
  ```

### 3. Falha de conexão inicial do backend com o banco de dados
- **Sintoma:** Container do backend reinicia repetidamente com exceção `Connection refused: db:5432`.
- **Causa:** A aplicação tentou se conectar antes do PostgreSQL concluir a criação dos schemas.
- **Solução:**
  1. O arquivo `docker-compose.yml` está configurado com `depends_on: db: condition: service_healthy`, garantindo que o PostgreSQL esteja respondendo ao `pg_isready`.
  2. Em caso de volumes corrompidos, reinicialize o ambiente do zero:
     ```bash
     docker compose down -v
     docker compose up --build -d
     ```

---

## 📘 Manual Operacional (Runbook)

Para procedimentos operacionais avançados, rotinas de monitoramento e contingência/rollback, consulte o [Runbook Operacional da Plataforma](./RUNBOOK.md).
