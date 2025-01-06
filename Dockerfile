# Use the official Yarn image which comes with Yarn pre-installed
FROM node:20-alpine

RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock* ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile --production && yarn cache clean

COPY . .

RUN yarn build

CMD ["yarn", "docker-start"]
