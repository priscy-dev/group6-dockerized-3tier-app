# Use the official Node.js Alpine image as the base for building the app
FROM node:20-alpine AS build

# set the working directory inside the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
# In production builds, npm ci (Clean Install) is faster and more reliable than npm install
RUN npm ci

# Copy the rest of your application code into the container
COPY . .

# Build the Vite application into static files (outputs to the /dist folder)
RUN npm run build

# Use a lightweight Nginx web server image for the production environment
FROM nginx:alpine

# Copy the static production build from the build stage to Nginx's default HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port 80 so the container can accept web traffic
EXPOSE 80

# Start Nginx in the foreground to keep the Docker container running
CMD ["nginx", "-g", "daemon off;"]