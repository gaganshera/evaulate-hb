FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Installing package.json and package-lock.json first, to take advantage of cached Docker layers
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# expose the port
EXPOSE 7100

# run the server
CMD [ "npm", "start" ]