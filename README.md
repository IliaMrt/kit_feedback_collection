# Backend for Kit feedback collection

<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>


## Description

This application was developed by [Ilya Martens](https://github.com/IliaMrt) with NestJS
framework as a backend part of a web application for a private school for collecting feedback from teachers.

## Requirements
- [Node.js](https://nodejs.org/en) (with [NPM](https://www.npmjs.com/))
- [PostgresQL](https://www.postgresql.org)

## Deploy

To deploy the application, first of all, you need to clone the repository to your PC.

You should create your config file "main.config.json" with follow mandatory fields:

        client_email - your service email as google API user,
        private_key - your private key to this email,
        settings_url - URL of google sheet doc (only mandatory part), with contain all settings,
        settings_page - name of the page with the settings

Then place the file in the directory:<br>
    to directly running - ./config.files<br>
    to running as docker-app - you have to specify a path to main.config.json in the 
    file docker-compose.yml, section "volumes" 

If you want to launch the application directly,
    create file ./prod.env and put the following variables in it:

        APP_PORT

        SMTP_HOST
        SMTP_PORT
        SMTP_USER
        SMTP_PASSWORD

        DB_HOST
        POSTGRES_USER
        POSTGRES_DB
        POSTGRES_PASSWORD
        POSTGRES_PORT

        JWT_SECRET_KEY
        JWT_ACCESS_EXPIRATION
        JWT_REFRESH_EXPIRATION
        
        TEACHER_SHEET_NAME
        KIDS_SHEET_NAME
        USERS_SHEET_NAME
        WRITE_SHEET_NAME
        LESSON_SHEET_NAME
        CLASSES_LIST_URL
        WRITE_LIST_URL
        USERS_LIST_URL
        LESSONS_LIST_URL
        SCHEDULE_URL
        CLIENT_URL



If you want to launch the application as docker app,
create file ./docker.env and put the following variables in it:

        APP_PORT

        DB_HOST
        POSTGRES_USER
        POSTGRES_DB
        POSTGRES_PASSWORD
        POSTGRES_PORT
the rest of the variables you have to put in your google sheet configuration document:
(mandatory column names - "name" and "value")

        SMTP_HOST
        SMTP_PORT
        SMTP_USER
        SMTP_PASSWORD

        JWT_SECRET_KEY
        JWT_ACCESS_EXPIRATION
        JWT_REFRESH_EXPIRATION

        TEACHER_SHEET_NAME
        KIDS_SHEET_NAME
        USERS_SHEET_NAME
        WRITE_SHEET_NAME
        LESSON_SHEET_NAME
        CLASSES_LIST_URL
        WRITE_LIST_URL
        USERS_LIST_URL
        LESSONS_LIST_URL
        SCHEDULE_URL
        CLIENT_URL

In order to run application directly, you should start it with command
```bash
$ npm run start:prod
```

to run application with docker, enter commands
```bash
$ sudo docker-compose build
$ sudo docker-compose up 
```
