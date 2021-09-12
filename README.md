# Video gallery
Video gallery is a backend application, witch provide API to register user and upload, watch, share, delete videos, depending on the user rights.

## Installation
1)Create .env file in the root folder, provide next variables: MONGO_LOGIN, MONGO_PASSWORD, MONGOD_HOST, MONGO_PORT, MONGO_DATABASE, JWT_ACCESS_TOKEN_SECRET, JWT_ACCESS_TOKEN_EXPIRATION_TIME, JWT_REFRESH_TOKEN_SECRET, JWT_REFRESH_TOKEN_EXPIRATION_TIME

2)The root folder includes docker-compose.yaml file. Use command bellow to install and setup mongodb container:
```bash
$ docker-compose up -d
```

3)Install packages:
```bash
$ npm install
```

## Build the app
```bash
$ npm run build
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## RESTful APIs description
Run application and open the link:
[Swagger](http://localhost:3000/api)
