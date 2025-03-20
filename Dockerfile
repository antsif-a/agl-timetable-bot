FROM node:lts-alpine3.17
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
RUN yarn run build
CMD ["sh", "-c", "yarn db:deploy && yarn start"]
