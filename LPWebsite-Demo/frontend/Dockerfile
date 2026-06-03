# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port (should match your FRONTEND_PORT in docker-compose)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
