## What is lite-api
lite-api is an easy to configure and use mock server. You can easly start your mock server in less than 10 seconds. 

## Why I need lite-api

Think about that you are developing a front-end web applibation, or mobile appication whichi sending json data to api or rerieving json data from api. 

## How to install

npm install -g lite-api

## How to start

lite-api --watch config.json --port 8080

You can configure your api with a json file. This configuration file will be created for the first run where you have called lite-api command. You are easily able to define your own file with --watch flag. Any changes at this file will be watched and implemented to your api immeditately. 

You can also configre your api port with --port flag. Your default port will be configured as 8080. You can reach your api over http://localhost:8080 or http://127.0.0.1:8080 by default. 

