FROM node:latest

# Create app directory
WORKDIR /app

# Bundle app source
COPY . /app
RUN npm install

EXPOSE 80
CMD [ "npm", "start" ]
