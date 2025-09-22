FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=2000
EXPOSE 2000
CMD ["node","server.js"]
