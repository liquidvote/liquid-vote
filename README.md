# Liquid Vote

## Local Dev

### terminal 1 - App
```
cd app
npm start
```

### terminal 2 - Server
```
cd graphql-server
npm run dev
```

## Deploy
### App
```
cd react-app
npm run deploy
```
### Server
```
cd graphql-server
npm run zip
// upload dist.zip to elastic beanstalk manually (TODO: automate this step)
```
