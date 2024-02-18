# syntax=docker/dockerfile:1

FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . ./
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
EXPOSE 5000
CMD ["npm", "run", "docker"]
