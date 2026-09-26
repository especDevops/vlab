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

Caso queira alterar a URL da API, crie um arquivo `.env` na raiz da pasta `vlab`:
```env
VITE_API_URL=http://localhost:8080
```

---

## 🚀 Passo a Passo para Execução (Desenvolvimento)

### 1. Instalar as dependências
```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em:
👉 **`http://localhost:5173/`**

O servidor possui Hot Module Replacement (HMR) ativado, recarregando a interface instantaneamente a cada alteração no código.

---

## 🧪 Testes e Qualidade de Código

### Executar os testes automatizados
Roda a suíte de testes com Vitest:
```bash
npm test
```

### Executar o Linter (Oxlint)
Analisa o código em busca de erros de sintaxe, boas práticas e vulnerabilidades:
```bash
npm run lint
```

---

## 📦 Build e Deploy (Produção)

### 1. Gerar o Build Otimizado
O comando abaixo compila o TypeScript (`tsc -b`) e gera os arquivos estáticos otimizados (HTML, CSS e JS minificados):
```bash
npm run build
```
Os arquivos finais para publicação serão gerados dentro do diretório:  
📂 **`dist/`**

---

### 2. Testar o Build de Produção Localmente (Preview)
Para validar o comportamento do build de produção antes de subir para um servidor:
```bash
npm run preview
```
Disponível em: `http://localhost:4173/`

---

### 3. Deploy em Servidores Web ou Plataformas Cloud

#### Opção A: Plataformas Cloud (Vercel, Netlify, Cloudflare Pages)
- **Framework Preset:** Vite
- **Root Directory:** `vlab`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

#### Opção B: Servidor Nginx (Produção com suporte a SPA)
Adicione a seguinte configuração no bloco `server` do seu `nginx.conf`:
```nginx
server {
    listen 80;
    server_name seudominio.com;

    root /var/www/vlab/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy reverso opcional para o backend
    location /livros {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Opção C: Deploy com Docker 🐳

O projeto já conta com [`Dockerfile`](./Dockerfile), [`.dockerignore`](./.dockerignore) e [`nginx.conf`](./nginx.conf) configurados para produção.

##### Características da imagem:
- **Build Stage**: Utiliza `node:24-alpine` para gerar os arquivos estáticos otimizados com `npm ci` e `npm run build`.
- **Servidor Web**: Utiliza `nginx:alpine` para servir a SPA com alta performance.
- **Configuração Nginx**: Suporte a rotas SPA (`try_files $uri $uri/ /index.html;`), compressão Gzip ativa e cabeçalhos de cache para assets estáticos.
- **Configuração da API**: Aceita o argumento de build `VITE_API_URL` (padrão: `http://localhost:8080`).

##### 1. Construir a imagem Docker:
```bash
docker build -t vlab-frontend .
```

*Para definir uma URL de API customizada no build:*
```bash
docker build --build-arg VITE_API_URL=http://api.seudominio.com -t vlab-frontend .
```

##### 2. Executar o container:
```bash
docker run -d -p 3000:80 --name frontend-container vlab-frontend
```
Acesse a aplicação em: 👉 `http://localhost:3000`

##### 3. Comandos úteis:
```bash
docker logs -f frontend-container     # Ver logs de acesso do Nginx
docker stop frontend-container        # Parar o container
docker rm frontend-container          # Remover o container
```

---

## CI/CD com GitHub Actions e Docker Hub

O workflow [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) valida o frontend e os testes do backend em pull requests para `main`. Em um push para `main`, também publica as imagens do frontend (`vlab`) e do backend (`biblioteca-backend`) no Docker Hub, com tags `latest` e o SHA do commit do frontend.

Após a publicação, o runner self-hosted da organização faz pull e atualiza os containers usando a tag SHA, garantindo que o deploy corresponda ao commit que disparou o workflow. O frontend fica disponível em `http://localhost:5173` ou `http://127.0.0.1:5173`, e a API em `http://localhost:8080`. O Compose está em [`compose.deploy.yml`](./compose.deploy.yml); ambas as origens do frontend estão autorizadas no CORS.

### Configuração necessária

Configure estes **Environment secrets** em **Settings > Environments > lab**:

| Secret | Finalidade |
| :--- | :--- |
| `DOCKERHUB_USERNAME` | Namespace que contém os repositórios `vlab` e `biblioteca-backend` |
| `DOCKERHUB_TOKEN` | Token Docker Hub com permissão de push e pull |
| `POSTGRES_PASSWORD` | Senha correspondente ao banco associado ao volume persistente |
| `JWT_SECRET` | Segredo usado para assinar tokens JWT |

O runner DARTH pertence ao grupo de runners da organização e precisa estar acessível ao repositório `vlab`. O workflow seleciona os labels `self-hosted`, `Windows` e `X64`; `DARTH` é o nome do runner, não um label. O host precisa ter Docker e Docker Compose v2 disponíveis para a conta que executa o runner.

### Quando o workflow executa

- Push para `main`: valida, publica as imagens e faz deploy.
- Pull request para `main`: executa somente validação.
- `workflow_dispatch` na `main`: permite publicar e implantar a revisão selecionada.
- Push em outra branch: executa somente validação.

O backend é obtido da branch `main` de `especDevops/biblioteca-backend` quando o workflow roda. Um commit feito somente nesse repositório não dispara este workflow; para implantá-lo, é necessário executar o workflow do VLab após a atualização do backend. Para detalhes operacionais, consulte o [Runbook](./RUNBOOK.md#sop-07-cicd-com-github-actions-e-docker-hub).

---

## ⚙️ Como Deixar Rodando na Máquina (Segundo Plano / Serviço)

### Opção 1: Usando PM2 + Serve (Recomendado para Servidores Locais)
Esta é a maneira mais robusta de manter a versão de produção servida localmente e com reinicialização automática.

1. Instale o pacote `serve` e o `pm2`:
   ```powershell
   npm install -g serve pm2
   ```

2. Gere o build de produção:
   ```powershell
   npm run build
   ```

3. Inicie o serviço em segundo plano:
   ```powershell
   pm2 serve dist 5173 --spa --name "vlab-frontend"
   ```

4. Comandos de monitoramento e controle:
   ```powershell
   pm2 status             # Ver status do serviço
   pm2 logs vlab-frontend # Logs de acesso e erros
   pm2 stop vlab-frontend # Parar o serviço
   pm2 restart vlab-frontend # Reiniciar o serviço
   ```

5. Para persistir após reinício do Windows:
   ```powershell
   pm2 save
   ```

---

### Opção 2: PowerShell em Segundo Plano (Modo Preview)
Se quiser rodar sem instalar pacotes globais adicionais:
```powershell
Start-Process -FilePath "npm" -ArgumentList "run", "preview", "--", "--port", "5173", "--host" -WindowStyle Hidden
```

- Para encontrar o processo em execução:
  ```powershell
  Get-Process -Name "node"
  ```
- Para parar o processo:
  ```powershell
  Stop-Process -Name "node"
  ```

---

### Opção 3: Modo Desenvolvimento em Segundo Plano
Caso deseje manter o servidor de desenvolvimento ativo em segundo plano:
```powershell
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
```

---

## 📘 Manual Operacional (Runbook)

Para procedimentos operacionais avançados, troubleshooting de incidentes de rede/CORS, verificação de integridade e rollback, consulte o [Runbook Operacional do Frontend](./RUNBOOK.md).

