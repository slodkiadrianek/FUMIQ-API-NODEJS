# Use the official Node.js image as the base image
FROM node:23.8.0

# Set the working directory inside the container
WORKDIR /

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 3009

# Set environment variables (optional, can also be done in docker-compose or runtime)
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
