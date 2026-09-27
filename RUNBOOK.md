# Runbook Operacional: VLab - Biblioteca Virtual (Frontend) 💻⚙️

Este documento é o Manual Operacional (Runbook / SOP) da interface web SPA **VLab**. Ele orienta engenheiros de software, operadores e equipes de suporte na inicialização, validação de integridade, compilação de produção, deploy em containers e resolução de falhas.

---

## 1. Ficha Técnica e Arquitetura do Serviço

| Atributo | Detalhes |
| :--- | :--- |
| **Nome do Serviço** | `vlab-frontend` |
| **Tecnologias** | React 19, TypeScript, Vite 8, Axios, Vitest, Oxlint, Nginx Alpine |
| **Porta (Dev)** | `5173` (Vite dev server) |
| **Porta (Preview Local)** | `4173` (Vite preview) |
| **Porta (Docker standalone)** | `3000` (mapeada para a porta interna `80` do Nginx) |
| **Porta (deploy CI/CD)** | Frontend `5173`; API `8080`; PostgreSQL `5432` (loopback) |
| **Dependência Upstream** | API REST Backend (`biblioteca-backend`) na porta `8080` |
| **Artefato de Saída** | Diretório estático `dist/` |
| **Imagens Docker Hub** | `<namespace>/vlab:<commit SHA>` e `<namespace>/biblioteca-backend:<commit SHA>` |

### Fluxo de Comunicação
```mermaid
flowchart LR
  Browser["Navegador do Usuário"] -->|"HTTP :5173"| Nginx["VLab Frontend (Nginx SPA)"]
  Browser -->|"Axios HTTP REST :8080"| Backend["biblioteca-backend"]
  Backend -->|"JDBC :5432"| Database["PostgreSQL"]
```

---

## 2. Variáveis de Ambiente & Configuração de Build

> [!CRITICAL]
> **Atenção sobre Vite em Produção:**  
> O Vite compila as variáveis prefixadas com `VITE_` **em tempo de build** (estáticas no bundle JS).  
> Portanto, alterar variáveis via `docker run -e` em tempo de execução **não** altera o código compilado. Para alterar a URL da API no Docker, deve-se usar `--build-arg VITE_API_URL=...` durante o `docker build`.

| Variável | Valor Padrão | Descrição |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:8080` | URL base da API REST do backend |

Para ambiente de desenvolvimento local, crie um arquivo `.env` na raiz de `vlab/`:
```env
VITE_API_URL=http://localhost:8080
```

---

## 3. Procedimentos Operacionais Padrão (SOP)

### SOP-01: Inicialização em Modo Desenvolvimento Local

```powershell
# 1. Navegar até o diretório do frontend
cd C:\Users\nando\GitHub\vlab

# 2. Instalar dependências (caso não estejam instaladas ou após atualizações)
npm install

# 3. Iniciar servidor Vite com Hot Module Replacement (HMR)
npm run dev
```
Acesse em: 👉 `http://localhost:5173`

---

### SOP-02: Execução de Testes e Validação de Qualidade

Antes de qualquer merge ou deploy, execute a suíte de verificação:

```powershell
# 1. Executar análise estática de código (Oxlint)
npm run lint

# 2. Executar suíte de testes unitários e de componentes (Vitest)
npm test
```

---

### SOP-03: Geração do Pacote de Produção (Build)

Compila os tipos TypeScript e minifica os ativos web:

```powershell
npm run build
```
- Os artefatos finais são gerados no diretório `dist/`.
- Caso haja qualquer erro de tipagem no TypeScript, o comando `tsc -b` interromperá a compilação antes de gerar o bundle.

---

### SOP-04: Teste de Pré-Produção Local (Preview)

Permite testar o comportamento do bundle compilado em `dist/` antes do deploy real:

```powershell
npm run preview
```
Acesse em: 👉 `http://localhost:4173`

---

### SOP-05: Execução Contínua em Servidor Local com PM2 + Serve

Para ambientes onde a SPA deve rodar como serviço em background no Windows/Linux sem Docker:

```powershell
# 1. Instalar utilitários globais
npm install -g serve pm2

# 2. Gerar o build otimizado
npm run build

# 3. Iniciar o serviço SPA escutando na porta 5173
pm2 serve dist 5173 --spa --name "vlab-frontend"

# 4. Comandos de monitoramento
pm2 status vlab-frontend          # Status de CPU/Memória
pm2 logs vlab-frontend            # Logs de requisições
pm2 restart vlab-frontend         # Reinicialização
pm2 stop vlab-frontend            # Parada do serviço
```

---

### SOP-06: Operação com Docker & Nginx

#### 1. Build da imagem com URL padrão da API (`http://localhost:8080`):
```bash
docker build -t vlab-frontend:latest .
```

#### 2. Build da imagem para ambiente com URL de API customizada:
```bash
docker build --build-arg VITE_API_URL=https://api.meudominio.com -t vlab-frontend:latest .
```

#### 3. Iniciar o container:
```bash
docker run -d \
  -p 3000:80 \
  --name vlab-frontend \
  --restart unless-stopped \
  --memory="256m" \
  vlab-frontend:latest
```
Acesse em: 👉 `http://localhost:3000`

---

### SOP-07: CI/CD com GitHub Actions e Docker Hub

O workflow `.github/workflows/ci.yml` valida frontend/backend e analisa JavaScript/TypeScript com CodeQL em pull requests para `main`. Para push ou execução manual na `main`, aguarda o Quality Gate do SonarQube Cloud antes de publicar imagens e atualizar os containers no runner DARTH.

#### Gatilhos e tags

| Evento | Comportamento |
| :--- | :--- |
| Push para `main` | Valida, executa CodeQL e SonarCloud, publica imagens e faz deploy se os gates passarem |
| Pull request para `main` | Executa validação e CodeQL; SonarCloud roda somente no fluxo de deploy da `main` |
| `workflow_dispatch` em `main` | Valida, executa CodeQL e SonarCloud, publica e implanta a revisão selecionada |
| Push para outra branch | Executa somente validação |

Cada imagem é publicada com as tags `latest` e o SHA do commit do frontend. O deploy define `IMAGE_TAG` como `${{ github.sha }}` e faz pull dessa tag imutável, em vez de depender do ponteiro mutável `latest`. Assim, as imagens implantadas correspondem ao commit que disparou aquela execução.

O backend é clonado da branch `main` do repositório público `especDevops/biblioteca-backend` quando o workflow roda. Commits feitos somente nesse repositório não iniciam o workflow do frontend; para implantar uma alteração isolada do backend, é necessário disparar o workflow do VLab depois que ela estiver na `main` do backend.

#### Secrets do Environment `lab`

Configure os valores em **Settings > Environments > lab > Environment secrets**. O workflow usa-os em tempo de execução, sem gravá-los em arquivos do repositório.

| Secret | Uso |
| :--- | :--- |
| `DOCKERHUB_USERNAME` | Namespace que contém os repositórios Docker Hub `vlab` e `biblioteca-backend` |
| `DOCKERHUB_TOKEN` | Autenticação para publicar e baixar imagens |
| `POSTGRES_PASSWORD` | Senha atual do PostgreSQL associado ao volume persistente |
| `JWT_SECRET` | Segredo usado pela API para assinar tokens |

`POSTGRES_PASSWORD` deve corresponder à senha gravada no volume existente. Alterar somente a secret não modifica a senha de um banco que já foi inicializado.

#### CodeQL e SonarQube Cloud

O job CodeQL analisa JavaScript/TypeScript com a query suite `security-extended` e publica SARIF no GitHub Code Scanning. Ele executa em PRs e pushes; porém, a conclusão verde do job significa que o scan foi executado e enviado, não que não existam alertas. Para impedir merge com findings, habilite uma ruleset/branch protection para `main` que exija resultados de code scanning do CodeQL e restrinja pushes diretos.

O SonarCloud analisa o frontend em pushes/dispatch na `main`. O relatório LCOV é gerado por `npm run test:coverage`; a action espera o resultado com `sonar.qualitygate.wait=true`, e qualquer Quality Gate reprovado bloqueia `publish-images` e `deploy-local`.

Crie primeiro o projeto `especDevops/vlab` no SonarQube Cloud e atribua a ele o Quality Gate desejado. Configure em **Settings > Environments > lab**:

| Tipo | Nome | Valor |
| :--- | :--- | :--- |
| Environment secret | `SONAR_TOKEN` | Token do SonarQube Cloud com permissão de análise no projeto |
| Environment variable | `SONAR_ORGANIZATION` | Organization key do SonarQube Cloud |
| Environment variable | `SONAR_PROJECT_KEY` | Project key do projeto criado para este repositório |

O SonarCloud não roda em PRs neste workflow para manter o token restrito ao deploy de `main`. A análise CodeQL do repositório atual cobre o frontend TypeScript; a análise do backend Java deve ser configurada no próprio repositório `biblioteca-backend` para publicar findings no lugar correto.

O teste atual gera cobertura baixa no conjunto completo; defina no SonarCloud o Quality Gate apropriado para a baseline e aumente testes de frontend para cobrir código novo sem desativar a verificação de cobertura.

#### Runner DARTH

O runner está registrado no nível da organização, no grupo `Default`, com os labels `self-hosted`, `Windows` e `X64`. O workflow seleciona exatamente esses labels; `DARTH` é o nome do runner, não um label. O grupo precisa permitir acesso ao repositório `vlab`, o runner deve estar online, e a conta que executa o runner precisa acessar Docker Engine/Desktop e Docker Compose v2.

Restrinja o grupo aos repositórios confiáveis que necessitam do runner. Permitir que todos os repositórios públicos executem jobs self-hosted aumenta o risco de execução de código não confiável na máquina de deploy.

#### Stack de deploy

O `docker-compose.yml` publica o frontend em `http://localhost:5173` ou `http://127.0.0.1:5173`, a API em `http://localhost:8080` e o PostgreSQL em `localhost:5432`, todas as portas limitadas a loopback. As duas URLs do frontend estão autorizadas no CORS do backend; `localhost` e `127.0.0.1` são origens distintas para o navegador. No deploy, `COMPOSE_PROJECT_NAME=github` preserva o volume `github_biblioteca_db_data` existente. O workflow baixa as imagens e usa `--no-build` para atualizar os serviços com o `compose up`, depois lista o estado final com `docker compose ps`.

Para fazer manualmente pull e atualização no host, defina na sessão as variáveis `DOCKERHUB_USERNAME`, `IMAGE_TAG`, `POSTGRES_PASSWORD` e `JWT_SECRET`, usando valores guardados de forma segura:

```powershell
$env:COMPOSE_PROJECT_NAME = "github"
docker compose -f docker-compose.yml pull
docker compose -f docker-compose.yml up -d --no-build --remove-orphans --wait --wait-timeout 180
docker compose -f docker-compose.yml ps
```

Use `IMAGE_TAG=latest` para buscar o ponteiro mais recente; para reproduzir um deploy específico, use o SHA correspondente.

#### Acompanhar execuções e filas

```powershell
gh run list --workflow ci.yml
gh run view <RUN_ID> --log-failed
gh run rerun <RUN_ID> --failed
gh run cancel <RUN_ID>
```

O job `deploy-local` usa o grupo de concorrência `vlab-local-deployment`. Se uma execução antiga estiver sem runner e bloquear uma execução posterior, confirme qual run está retendo o grupo e cancele somente a execução obsoleta. Se o pull ou o `compose ps` falhar por variável obrigatória ausente, verifique os nomes das secrets do Environment `lab`; os comandos Compose precisam dessas variáveis até para listar a stack.

---

## 4. Verificação de Integridade (Health Check & Smoke Test)

Execute as validações a seguir após iniciar a interface:

### 1. Teste de Resposta HTTP do Servidor Web
```powershell
# Validar se o servidor está respondendo com HTTP 200
(Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing).StatusCode
# (Ou porta 3000 se rodando em Docker)
```
*Resultado Esperado:* `200`

### 2. Validação de Conectividade com o Backend
1. Abra o navegador em `http://localhost:5173` (ou `3000`).
2. Abra o Console de Ferramentas do Desenvolvedor (`F12` -> aba *Console* e *Network*).
3. Verifique se a requisição `GET /livros` é disparada com sucesso (`HTTP 200`).
4. Caso a tela exiba mensagem de erro ou lista vazia por falha de rede, consulte a seção de incidentes abaixo.

---

## 5. Matriz de Resolução de Incidentes (Troubleshooting)

### Incidente 1: `Port 5173 (ou 3000) already in use`
- **Sintoma:** O Vite sobe em outra porta (ex: `5174`) ou o Docker acusa `port is already allocated`.
- **Ação de Diagnóstico:**
  ```powershell
  Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, OwningProcess
  ```
- **Ação Corretiva:**
  ```powershell
  Stop-Process -Id <PID> -Force
  ```
  No Docker:
  ```bash
  docker ps --filter "publish=3000"
  docker stop <CONTAINER_ID>
  ```

---

### Incidente 2: `AxiosError: Network Error` ou Erro de CORS no Navegador
- **Sintoma:** O frontend carrega, mas os livros não aparecem e o console do navegador exibe `ERR_CONNECTION_REFUSED` ou `Access-Control-Allow-Origin missing`.
- **Causas Possíveis & Soluções:**
  1. **Backend Offline:** Verifique se o backend está rodando em `http://localhost:8080`:
     ```powershell
     Test-NetConnection -ComputerName "localhost" -Port 8080
     ```
  2. **Origem CORS não permitida:** `http://localhost:5173` e `http://127.0.0.1:5173` são origens diferentes. O Compose permite ambas; após alterar `WEB_ORIGENS_PERMITIDAS`, recrie o container backend com `docker compose up -d --force-recreate backend`.
  3. **URL da API incorreta:** Verifique o valor de `VITE_API_URL` configurado. Se o container foi construído sem o `--build-arg` adequado, recompile a imagem.

---

### Incidente 3: Falha no comando `npm run build` (`TS2304` / Erro de compilação TypeScript)
- **Sintoma:** O build falha na etapa `tsc -b`.
- **Causa:** Inconsistência de tipos ou alterações de interface não compatíveis.
- **Ação de Diagnóstico:**
  ```powershell
  npx tsc -b --noEmit
  ```
- **Ação Corretiva:** Ajustar os arquivos TypeScript indicados ou verificar compatibilidade em `src/services/livroService.ts`.

---

### Incidente 4: Erro 404 ao recarregar a página em produção (Nginx)
- **Sintoma:** Acessar a raiz funciona, mas ao atualizar uma rota interna diretamente a página exibe `404 Not Found`.
- **Causa:** O servidor web não está redirecionando rotas inexistentes para `index.html`.
- **Validação:** Garanta que o arquivo `nginx.conf` possua a diretiva SPA:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```

---

### Incidente 5: Cache local do Vite corrompido ou desatualizado
- **Sintoma:** Alterações em componentes ou dependências não têm efeito no navegador durante `npm run dev`.
- **Ação Corretiva:**
  ```powershell
  # Limpar o cache de compilação do Vite e dependências
  Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
  npm run dev -- --force
  ```

---

## 6. Procedimento de Parada e Rollback de Emergência

### Parada Imediata do Processo Local:
```powershell
# Encerrar processos Node do usuário
Get-Process -Name "node" | Stop-Process -Force
```

### Parada do Container Docker:
```bash
docker stop vlab-frontend
docker rm vlab-frontend
```

### Rollback de Versão em Produção:
1. Reverter para a tag anterior homologada:
   ```bash
   docker run -d -p 3000:80 --name vlab-frontend vlab-frontend:v1.0.0
   ```
2. Caso use hospedagem estática (S3/Vercel/Netlify), realize o rollback instantâneo pelo painel de controle ou redeploy do commit estável anterior.
