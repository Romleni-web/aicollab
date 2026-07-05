# Use the full Node image to ensure all build tools are available
FROM node:20

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript globally to fix permission issues with local binaries
RUN npm install -g typescript

# Copy the rest of the source code
COPY . .

# Run the compiler directly using the global tsc
RUN tsc

# Expose the production port
EXPOSE 3001

# Start the server using the compiled JS
CMD ["node", "dist/index.js"]
