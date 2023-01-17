FROM node:16-alpine3.11
RUN mkdir -p /app
WORKDIR /app
COPY app/package.json .
COPY app/package-lock.json .
RUN npm install
COPY app/ .
EXPOSE 3000
EXPOSE 8080
CMD ["npm", "start"]
# CMD ["sleep", "infinity"]

