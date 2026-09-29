# ==========================================
# Etapa 1: Build da aplicação React + Vite
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

# Variável de build configurável para a URL da API do backend
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

# Copia arquivos de gerenciamento de dependências
COPY package*.json ./

# Instala as dependências da aplicação
RUN npm ci

# Copia o código-fonte
COPY . .

# Compila o projeto gerando o build estático de produção em /app/dist
RUN npm run build

# ==========================================
# Etapa 2: Servidor Web Nginx de Produção
# ==========================================
FROM nginx:1.27-alpine

# Ajusta permissões para execução como usuário não-root
RUN sed -i 's#pid[[:space:]]*/run/nginx.pid;#pid /tmp/nginx.pid;#' /etc/nginx/nginx.conf \
	&& chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run /etc/nginx/conf.d

# Copia a configuração otimizada do Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos compilados da etapa de build
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Expõe a porta HTTP do container em 8080 para permitir execução sem root
EXPOSE 8080

# Healthcheck do servidor web
HEALTHCHECK --interval=10s --timeout=3s --retries=3 --start-period=5s CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

# Inicia o Nginx em modo foreground sem privilégios de root
USER nginx
CMD ["nginx", "-g", "daemon off;"]
