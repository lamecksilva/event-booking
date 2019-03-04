FROM node:11-stretch

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 9000