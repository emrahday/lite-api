# What is lite-api
lite-api is an easy to configure and use mock server. You can easly start your mock server less than 10 seconds. 

# Why I need lite-api

Think about that you are developing a front-end web application, or mobile application which is sending json data to api or retrieving json data from api. In a real word scenario it is difficult to prepare api and client side development as parallel therefore you need to be syncronized to api development and deployment of api in most cases. 

With lite-api, after an agreement on api endpoints and http methods, both side can develop independently without blocking each other. 

For example;
If you want to login form and you want to test your implementation by post email, and password to api. Simply configure your configuration json file. By default it is **config.json**

```json
[
  {
    "path": "user",
    "method": "POST",
    "response": {
        "email": "foo@bar.com"
    }
  }
]
```

This configuration will create a api endpoint which acceept POST request, and responses with configured response data. After you made the request it will store the data to the same file which you send as;

```json
{
    "path": "user",
    "method": "GET",
    "response": {
      "email": "foo@bar.com"
    },
    "request": {
        "email": "foo@bar.com",
        "password": "xyz"
    }
  }
]
```

there you can validate your api request parameter and you can test your client application with returned response. 

In addition to this simple example lite-api has some additional rich features such as placeholder, random id generation, time stamps etc. 

Changes in your configuration file is watched, and any changes in this file will be implemented immediately. So you do not need to restart lite-api after configuration changes.

# How to install

```
npm install -g lite-api
```

# How to start

```
lite-api --watch config.json --port 8080
```

You can configure your api with a json file. This configuration file will be created for the first run where you have called lite-api command. You are easily able to define your own file with ***--watch*** flag. Any changes at this file will be watched and implemented to your api immeditately. 

You can also configre your api port with **--port*** flag. Your default port will be configured as 8080. You can reach your api over http://localhost:8080 or http://127.0.0.1:8080 by default. 

# Some features of lite-api

## Simple GET response

For that configuration it will create an api endpoint which will be accessible with http://localhost:8080/user . 

```json
[
    {
        "path": "user",
        "method": "GET",
        "response": {
           "email": "foo@bar.com",
        }
    }
]
```

When you call http://localhost:8080/user endpoint it will return data as

```json 
    { "email": "foo@bar.com" }
```

## Simple POST stored request and response

It is also receives your post body, query parameters, or 
request parameters. For example with this settings;

```json
[
    {
        "path": "user",
        "method": "POST",
        "response": {
            "email": "foo@bar.com",
        }
    }
]
```

if you post data to http://localhost:8080/user with request body such as;

```json
{
    "email": "foo@bar.com",
    "password": "xyz"
}
  
```

it will store this sent body to configuration file as;

```json
[
    {
        "path": "user",
        "method": "POST",
        "response": {
            "email": "foo@bar.com",
        },
        "request": {
            "email": "foo@bar.com",
            "password": "xyz"
        }
    }
]
```

it is also possible to send and store with query parameter such as by calling ;
http://localhost:8080/user?email=foo&name=bar


## Simple POST with generated random id

you can use placeholder ```${random()}``` in order to create some random values

```json 
[
    {
    "path": "user",
    "method": "POST",
    "response": {
        "id": "${random()}",
        "email": "foo@bar.com",
    },
    "request": {
        "email": "foo@bar.com",
        "password": "xyz"
    }
  }
]
```

## Simple POST with referenced placeholders

you can use placeholder referecence value from response to request. placeholder is useful way to send and store some values to api and receive same value by response in same http request.

```json 
[
    {
    "path": "user",
    "method": "POST",
    "response": {
        "id": "${random()}",
        "email": "${email}",
        "name": "${name}",
    },
    "request": {
        "email": "foo@bar.com",
        "name": "Foo",
        "password": "xyz"
    }
  }
]
```

## Simple PUT with timestamp

it is also possible to get timestamp with current time by using ```${time()}``` 

```json 
[
    {
    "path": "user",
    "method": "PUT",
    "response": {
        "id": "${random()}",
        "email": "${email}",
        "name": "${name}",
        "created": "${time()}"
    },
    "request": {
        "email": "foo@bar.com",
        "name": "Foo",
        "password": "xyz"
    }
  }
]
```

## Simple Get with extended path

Path do not have to be single word, it is also possible to combine multiple word such as ```user/list```

```json
[
    {
        "path": "user/list",
        "method": "GET",
        "response": {
            "id": "${random()}",
            "name": "foo"
        }
    }
]
```

## Simple Get with response as array

Resonse can be an object but also it can be an array. 

```json
[
    {
        "path": "user/list",
        "method": "GET",
        "response": [
            {
                "id": "${random()}",
                "name": "foo"
            },
            {
                "id": "${random()}",
                "name": "foo"
            }
        ]
    }
]
```

## Simple path with placeholder

Paths also can have placeholder for more seo friendly urls. 

```json
[
    {
        "path": "user/:id",
        "method": "GET",
        "response": {
            "name": "foo"
        }
    }
]
```

And it will store the id which you sent. For example if you call http://localhost:8080/user/123 in this url placeholder after /user/ in will be stored as id in request. 

```json
[
    {
        "path": "user/:id",
        "method": "GET",
        "response": {
            "name": "foo"
        },
        "request": {
            "id": 123
        }
    }
]
```

## Multiple method in same config

You can handle multiple method in same config entry by seperating with ```|``` such as ```GET|POST|DELETE|PUT```

```json
[
    {
       "path": "user",
       "method": "GET|POST|DELETE|PUT",
       "response": {
         "id": "${random()}",
         "name": "Foo"
       }
     }
]
```

## Overloaded path

It is possible to overload constant path with placholder path. 

```json
[
    {
        "path": "user/create",
        "method": "POST",
        "response": {
            "id": "${random()}",
            "name": "foo"
        }
    },
    {
        "path": "user/:id",
        "method": "GET",
        "response": {
            "id": "${random()}",
            "name": "foo"
        }
    }
]
```

For overloading example ***ordering is important** because path **user/create** will handle the request first before **user/:id**. if you call http://localhost:8080/user/create and http://localhost:8080/user/123 as normal way. And for http://localhost:8080/user/123 it will store the given id to 'request' as;

```json
[
    {
        "path": "user/:id",
        "method": "GET",
        "response": {
            "id": "${random()}",
            "name": "foo"
        },
        "request": {
            "id": 123
        }
    }
]
```
