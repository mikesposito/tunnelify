FROM node:14-alpine as builder

RUN npm install -g @mikesposito/tunnelify-provider@$TUNNELIFY_VERSION

CMD npx tunnelify-provider -h $TUNNELIFY_HOST $TUNNELIFY_COMMAND -p 80
EXPOSE 80