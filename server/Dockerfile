# Use a standard node image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies like typescript)
RUN npm install

# Copy the rest of the server code
COPY . .

# Build the project using npx to ensure tsc is found
RUN npx tsc

# Expose the port
EXPOSE 3001

# Start the server
CMD ["node", "dist/index.js"]
