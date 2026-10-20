FROM node:24-alpine
WORKDIR /app
COPY package.json server.mjs catalog.json ./
COPY public ./public
RUN mkdir -p data && chown -R node:node /app
USER node
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["node", "server.mjs"]
