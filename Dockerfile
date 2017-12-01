FROM node:7.9.0
RUN echo "0.0.0.0   markowitz.lvovsky.com" >> /etc/hosts

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN mv /usr/src/app/gcloud_env /usr/src/app/.env

ADD package.json /app/

RUN npm config set registry https://registry.npmjs.org/
RUN npm install
ENV HOST=0.0.0.0
CMD HOST=0.0.0.0 npm start
