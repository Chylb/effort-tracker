FROM node:18.15.0 as build-stage

RUN mkdir /usr/app
COPY . /usr/app

WORKDIR /usr/app

RUN npm i --legacy-peer-deps

ENV PATH /usr/src/app/node_modules/.bin:$PATH

ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL $REACT_APP_BACKEND_URL
ARG REACT_APP_MAPBOX_API_KEY
ENV REACT_APP_MAPBOX_API_KEY $REACT_APP_MAPBOX_API_KEY

RUN npm run build

#stage 2
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build-stage /usr/app/build .
COPY ./nginx.conf /etc/nginx/nginx.conf 

ENTRYPOINT ["nginx", "-g", "daemon off;"]