FROM node:20
WORKDIR /app
RUN npm install -g typescript
COPY . .
RUN npm install
CMD ["npm", "run", "compile"]