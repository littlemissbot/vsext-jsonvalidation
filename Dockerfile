FROM node:20
WORKDIR /app
RUN npm install -g yo generator-code
CMD ["yo", "code"]
