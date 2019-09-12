# Välkommen hit - admin
This is the source code for the admin GUI of Välkommen hit

## Development
```
npm start
```

## Build
```
REACT_APP_ENV argument can be any of these: dev, cont, prod

eg: REACT_APP_ENV=cont npm run build
```

## Deployment
First build the application targeting the correct stage and then deploy to the same stage. e.g:
```
yarn && npm run build:cont && npm run deploy:cont
```

## Environment Variables
Add the variables to a file called __.env.{stage}__

### Available Environment Variables
```
REACT_APP_ENV
REACT_APP_LAMBDA_URL
REACT_APP_AWS_DEFAULT_REGION
REACT_APP_AWS_COGNITO_APP_CLIENT_ID
REACT_APP_AWS_COGNITO_USER_POOL_ID
REACT_APP_AWS_DOMAIN_NAME
REACT_APP_MAP_PROXY_URL
```
