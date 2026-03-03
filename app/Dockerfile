FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copiar el resto de la aplicación
COPY . .

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando de inicio
CMD ["npm", "start"]
