# Use a base image with Node.js and npm installed
FROM node:20

# Set the working directory
WORKDIR /app

# Install TypeScript globally
RUN npm install -g typescript

# Copy the project files into the container
COPY . .

# Install all dev dependencies
RUN npm install

# Command to compile and run the extension
CMD ["npm", "run", "compile"]