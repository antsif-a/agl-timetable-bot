FROM node:23-alpine
WORKDIR /app
COPY package.json yarn.lock ./
COPY scripts scripts
RUN apk add --no-cache --upgrade bash jq git openssl

RUN yarn install
RUN bash scripts/gen-types.docker.sh
COPY . .
RUN yarn run build
CMD ["sh", "-c", "yarn db:deploy && yarn start"]
