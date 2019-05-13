const argv = require('yargs').argv;
const fs = require('fs');
const chalk = require('chalk');
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require("crypto");
const app = express();

let server;
let config;
let watcher;

const INIT_JSON = [
    { "path": "user", "method": "GET", "response": { "foo": "ttt" } }
];

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())

// SECTION 

function handlePlaceholders(endpoint) {
    const responseArray = Array.isArray(endpoint.response)
        ?  endpoint.response
        : [endpoint.response]
    
        responseArray.forEach( response => {
        Object.entries(response).forEach(entry => {
            const [key, value] = entry;
            if (value === "${time()}") {
                response[key] = (new Date()).getTime();
            } else if (value === "${random()}") {
                response[key] = crypto.randomBytes(16).toString("hex");
            } else if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
                response[key] = endpoint.request[value.slice(2, value.length - 1)]
            }
        });
    })    
}

function getEndpoint(path, method) {
    return config.find(item => {
        return item.path === path
            && item.method.toLowerCase().indexOf(method.toLowerCase()) > -1;
    });
}

function getEndpointIndex(path, method) {
    return config.findIndex(item => {
        return item.path === path
        && item.method.toLowerCase().indexOf(method.toLowerCase()) > -1;
    });
}


function prepareResponse(path, method) {
    const endpoint = getEndpoint(path, method);
    handlePlaceholders(endpoint);
    return endpoint.response;
}

// SECTION Api

function handleApiEndpoints(config) {
    config.forEach(endpoint => {
        const rootPath = `/${endpoint.path}`;
        const methods = endpoint.method.toLowerCase().split('|');
        methods.forEach( method => {
            app[method](rootPath, (req, res) => {
                console.log(`Received ${chalk.green(method.toUpperCase())} request ${chalk.green(req.originalUrl)} with body ${chalk.green(JSON.stringify(req.body))} `);
                const data = Object.assign({}, req.params, req.query, req.body); //TODO what is the natural behaviour, which one is override body or query
                writeRequest(endpoint.path, endpoint.method, data);
                const response = prepareResponse(endpoint.path, method);
                res.send(response);
            });
            console.log(`Listening ${chalk.green(method.toUpperCase())} ${rootPath}`);
        })
    });
}

async function runServer() {
    if (!server) {
        server = app.listen(argv.port, () => {
            console.log(`API is available at ${chalk.yellow(`http://localhost:${argv.port}`)}`);
        });
    }
    return server;
}

// SECTION File handler 

function writeRequest(path, method, data) {
    const index = getEndpointIndex(path, method)
    if (index !== -1) {
        config[index].request = data;
        fs.writeFileSync(argv.watch, JSON.stringify(config, null, 2));
    }
}

async function readFile(file) {
    const data = fs.readFileSync(file);
    return JSON.parse(data);
}

async function getDataFromFile() {
    const fileExist = fs.existsSync(argv.watch);
    if (!fileExist) {
        fs.writeFileSync(argv.watch, JSON.stringify(INIT_JSON, null, 2)); //TODO init data should be updated
        console.log(`Configuration file ${chalk.yellow(argv.watch)} is not exist ...`);
        console.log(`But it is created with simple configuration !`);
    }

    console.log(`Updated config from  ${chalk.yellow(argv.watch)}`);
    return await readFile(argv.watch);
}


function attachFileWatcher() {
    return fs.watch(argv.watch, async (eventType, fileName) => {
        console.log(`Updated config from  ${chalk.yellow(argv.watch)} by watcher`);
        config = await readFile(argv.watch);
    });
    //TODO if there is no file, it is creating file data but first time watcher run one more time reading file data, duplicate reading
}

//SECTION Init

async function init() {
    try {
        config = await getDataFromFile();
        watcher = attachFileWatcher();
        server = await runServer();
        if (config && server) {
            handleApiEndpoints(config);
        }
    } catch (error) {
        console.error(error);
    }
}

init();

process.on('exit', () => {
    if (watcher) {
        watcher.close();
    }
    if (server) {
        server.close();
    }
});

module.exports = init;

// TODO simdilik query ve body request json icinde request kismina atiliyor, ikisinin ayrimi yok