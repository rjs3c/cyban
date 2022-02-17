FROM node:16-alpine

LABEL maintainer Ryan Instrell
LABEL version 1.1

WORKDIR /app

COPY package*.json ./

RUN npm i --only=production

COPY . ./

ENV PORT 3000

EXPOSE $PORT

CMD ["node", "app/src/main.js"]

USER node