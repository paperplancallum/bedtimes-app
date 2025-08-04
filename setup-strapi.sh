#!/bin/bash

echo "Setting up Bedtimes Backend with Strapi..."

# Start PostgreSQL
echo "Starting PostgreSQL with Docker..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Install dependencies
echo "Installing dependencies..."
npm install

# Create Strapi app with PostgreSQL configuration
echo "Creating Strapi application..."
npx create-strapi-app@latest . --dbclient=postgres --dbhost=127.0.0.1 --dbport=5432 --dbname=bedtimes_db --dbusername=bedtimes --dbpassword=bedtimes_dev_password --dbssl=false --no-run --quickstart

echo "Setup complete! Run 'npm run develop' to start Strapi"