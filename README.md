# Effort tracker

Effort tracker is a tool that keeps track of your running performance, based on Strava API.

## Features
 - creation of distances of any length
 - visualization of running performance progress on given distance over the years
 - visualization of running performance progress on given distance throughout the season
 - measurement of time on each distance, on each activity
 - achievement system
 - automatic addition of achievements to strava activity

## Requirements
 - Node.js v14.16.1 >=
 - Npm 6.14.1 >= 
 - PostgreSQL 8.2 >=
 - JRE 17
## Setup
### Setup from source
#### Frontend
 1. create `.env` file and set:
    * `REACT_APP_MAPBOX_API_KEY`= Mapbox API token
    * `REACT_APP_BACKEND_URL`=http://localhost:8080
 2. run `npm install --legacy-peer-deps`
 3. run `npm start`

#### Backend
 1. configure database connection in `application.yml` file
 2. run Spring application with following enviroment variables:
    * `CLIENT-ID`= Strava client ID
    * `CLIENT-SECRET`= Strava client secret
    * `WEBHOOK_SUBSCRIPTION_ID`= ID of Strava webhook subscription
    
### Setup with Docker Compose
1. create `.env` file and set:
    * `MAPBOX_API_KEY`= Mapbox API token
    * `STRAVA_CLIENT_ID=58561`= Strava client ID
    * `STRAVA_CLIENT_SECRET`= Strava client secret
2. run `docker compose build`
3. run `docker compose up -d`

## Screenshots
![login](images/login.png)
![home](images/home.png)
![activities](images/activities.png)
![activity](images/activity.png)
![add_distance](images/add_distance.png)
![distances](images/distances.png)
![distance](images/distance.png)

 
 