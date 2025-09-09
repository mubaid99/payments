# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install any needed packages including devDependencies
RUN npm install

# Copy the rest of the client code
COPY . .

# Build the project using Vite
RUN npm run build

# Expose port 5000 to the outside once the container is launched
EXPOSE 5000

# Define environment variable
# ENV PORT=5000

# Run the app using "npm start" when the container launches
CMD ["npm", "start"]
