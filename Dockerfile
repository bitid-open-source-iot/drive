FROM node:14-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN mkdir tmp
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 9000
CMD ["node", "--inspect=9229", "index.js"]
