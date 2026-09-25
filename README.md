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
