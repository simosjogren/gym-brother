# Use the official Node.js image as the base image
FROM node:16.13.2

# Set the working directory inside the container
WORKDIR /app

# Download wait-for-it.sh and make it executable
RUN wget -O /usr/local/bin/wait-for-it.sh \
    https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
 && chmod +x /usr/local/bin/wait-for-it.sh

# Copy package.json and package-lock.json to install dependencies
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Docker variables
ENV DB_HOST=gymbro_postgres_db
ENV DB_NAME=gym-bro
ENV DB_USERNAME=postgres
ENV DB_PASSWORD=simo99123
ENV ORIGIN_IP_CORS=http://localhost:8080

# Expose port 3000 for the Node.js application
EXPOSE 3000

# Use wait-for-it.sh to wait for PostgreSQL to be ready before starting the Node.js application
CMD ["/usr/local/bin/wait-for-it.sh", "gymbro_postgres_db:5432", "--", "npm", "run", "start"]
