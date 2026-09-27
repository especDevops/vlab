# VLab - Biblioteca Virtual (Frontend) 💻📖

Interface Web Single Page Application (SPA) para gerenciamento e visualização do acervo de livros da biblioteca, construída com React 19, TypeScript e Vite.

---

## 🛠️ Tecnologias Utilizadas

- **Framework UI:** [React 19](https://react.dev/) + React DOM 19
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool & Bundler:** [Vite 8](https://vitejs.dev/)
- **Cliente HTTP:** [Axios](https://axios-http.com/)
- **Testes Unitários:** [Vitest](https://vitest.dev/) + Testing Library (`@testing-library/react`, `@testing-library/jest-dom`)
- **Linter & Code Quality:** [Oxlint](https://oxc-project.github.io/)

---

## 📋 Pré-requisitos

1. **Node.js**: Versão 20.x ou superior (testado e homologado no Node v24).
2. **NPM**: Versão 10.x ou superior (instalado junto com o Node).
3. **Backend da Biblioteca**: O servidor backend ([`biblioteca-backend`](../biblioteca-backend)) deve estar em execução na porta `8080` para comunicação completa com a API.

---

## ⚙️ Variáveis de Ambiente

Por padrão, a aplicação tenta se conectar em `http://localhost:8080`.

Crie um arquivo `.env` na raiz do projeto a partir do exemplo:
```bash
cp .env.example .env
```

Exemplo de configuração:
```env
VITE_API_URL=http://localhost:8080
```

---

## 🚀 Execução Rápida (Docker Compose)

O projeto inclui um único `docker-compose.yml` para subir frontend, backend e PostgreSQL. Copie `.env.example` para `.env`, informe seu namespace do Docker Hub e configure `POSTGRES_PASSWORD` e `JWT_SECRET` antes de iniciar. O frontend é construído localmente; o backend é obtido do Docker Hub:

```bash
docker compose up --build -d
```

A aplicação local estará disponível em:
👉 **`http://localhost:5173/`**

A API estará disponível em:
👉 **`http://localhost:8080`**

A base de dados PostgreSQL fica em:
👉 **`localhost:5432`**

---

## 🧪 Testes e Qualidade de Código

### Executar os testes automatizados
```bash
npm test
```

### Executar o Linter (Oxlint)
```bash
npm run lint
```

---

## 📦 Build e Deploy (Produção)

### 1. Gerar o Build Otimizado
```bash
npm run build
```

Os arquivos finais ficam em `dist/`.

### 2. Testar o build localmente
```bash
npm run preview
```
Acesse em: `http://localhost:4173/`

### 3. Build da imagem Docker
```bash
docker build -t vlab-frontend .
```

Para customizar a URL da API:
```bash
docker build --build-arg VITE_API_URL=http://api.seudominio.com -t vlab-frontend .
```

### 4. Executar a imagem standalone
```bash
docker run -d -p 3000:8080 --name frontend-container vlab-frontend
```
Acesse em: `http://localhost:3000`

---

## CI/CD com GitHub Actions e Docker Hub

O workflow [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) valida o frontend, executa CodeQL em JavaScript/TypeScript e testa o backend em pull requests para `main`. Nos pushes para `main`, aguarda também o Quality Gate do SonarQube Cloud antes de publicar as imagens do frontend (`vlab`) e do backend (`biblioteca-backend`) no Docker Hub, com tags `latest` e o SHA do commit.

Após a publicação, o runner self-hosted da organização faz pull e atualiza os containers usando a tag SHA, garantindo que o deploy corresponda ao commit que disparou o workflow. O frontend fica disponível em `http://localhost:5173` ou `http://127.0.0.1:5173`, e a API em `http://localhost:8080`. O mesmo [`docker-compose.yml`](./docker-compose.yml) serve para desenvolvimento e deploy: o workflow baixa as imagens publicadas e usa `--no-build` para não reconstruir o frontend. Ambas as origens do frontend estão autorizadas no CORS.

### Configuração necessária

Configure estes **Environment secrets** em **Settings > Environments > lab**:

| Secret | Finalidade |
| :--- | :--- |
| `DOCKERHUB_USERNAME` | Namespace que contém os repositórios `vlab` e `biblioteca-backend` |
| `DOCKERHUB_TOKEN` | Token Docker Hub com permissão de push e pull |
| `POSTGRES_PASSWORD` | Senha correspondente ao banco associado ao volume persistente |
| `JWT_SECRET` | Segredo usado para assinar tokens JWT |
| `SONAR_TOKEN` | Token do projeto/organização no SonarQube Cloud |

Configure estas **Environment variables** em `lab`:

| Variable | Finalidade |
| :--- | :--- |
| `SONAR_ORGANIZATION` | Organization key exibida no SonarQube Cloud |
| `SONAR_PROJECT_KEY` | Project key do projeto SonarCloud previamente criado para `especDevops/vlab` |

---

## ⚙️ Como Deixar Rodando na Máquina (Segundo Plano / Serviço)

### Opção 1: PM2 + Serve
```powershell
npm install -g serve pm2
npm run build
pm2 serve dist 5173 --spa --name "vlab-frontend"
```

### Opção 2: PowerShell em Segundo Plano
```powershell
Start-Process -FilePath "npm" -ArgumentList "run", "preview", "--", "--port", "5173", "--host" -WindowStyle Hidden
```

### Opção 3: Desenvolvimento em Segundo Plano
```powershell
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
```

---

## 📘 Manual Operacional (Runbook)

Para procedimentos operacionais avançados, troubleshooting de incidentes de rede/CORS, verificação de integridade e rollback, consulte o [Runbook Operacional do Frontend](./RUNBOOK.md).
