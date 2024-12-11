FROM node:20.18.1

WORKDIR /app

COPY Frontend/package.json ./

RUN npm install

COPY Frontend/ ./

EXPOSE 5173

CMD ["npm", "run", "dev"]