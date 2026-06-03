FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (includes multer, nodemailer, etc.)
RUN npm install && \
    # Clean npm cache to reduce image size
    npm cache clean --force

# Copy application codef
COPY . .

# Expose the port your app runs on
EXPOSE ${BACKEND_PORT}

# Start the application
CMD ["npm", "start"]