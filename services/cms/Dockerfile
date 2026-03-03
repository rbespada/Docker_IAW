# Use official Node.js 18 image
FROM node:18-alpine

# Install dependencies for Strapi building
RUN apk add --no-cache git python3 build-base

WORKDIR /srv/app

# copy package.json and yarn.lock / package-lock.json if present
COPY package.json yarn.lock* package-lock.json* ./

# install dependencies
RUN yarn install --production || npm install --production

# copy rest of source
COPY . .

EXPOSE 1337

# run Strapi
CMD ["npm", "run", "start"]
