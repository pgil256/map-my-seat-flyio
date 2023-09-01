# Use the official Node.js runtime as a base image
FROM node:18

# Set a base directory for the application inside the container
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# Copy over the rest of the files
WORKDIR /app
COPY . .

# Build the Vite app
WORKDIR /app/frontend
RUN npm run build

# Prepare to run the backend
WORKDIR /app/backend
EXPOSE 8080
CMD ["node", "server.js"]
