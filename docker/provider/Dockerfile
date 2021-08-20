FROM node:14-alpine as builder

WORKDIR /usr/src/app
COPY ./package.json ./
RUN yarn install
COPY . .

CMD node index.js -h $TUNNELIFY_HOST -p 80
EXPOSE 80