# Etap 1: Builder (Debian Slim)
FROM node:20-slim AS builder
WORKDIR /app

# Instalacja narzędzi kompilacji (wymagane dla niektórych modułów node)
RUN apt-get update && apt-get install -y python3 make g++ build-essential

# Kopiowanie plików konfiguracyjnych
COPY package*.json ./
COPY tsconfig*.json ./
# Ensure server directory exists for tsconfig copy if needed, though COPY creates dest
COPY server/tsconfig.json server/

# Czysta instalacja zależności
RUN npm ci

# Kopiowanie kodu źródłowego
COPY . .

# Budowanie (Backend + Frontend)
RUN npm run build

# Etap 2: Runner (Debian Slim)
FROM node:20-slim AS runner
WORKDIR /app

# Instalacja tylko zależności produkcyjnych
COPY package*.json ./
RUN npm ci --only=production

# Kopiowanie zbudowanej aplikacji
COPY --from=builder /app/dist ./dist

# Kopiowanie plików RAG (danych)
# Ensure destination directory exists or COPY will create it
COPY src/data /app/src/data

EXPOSE 8080
CMD ["npm", "start"]
