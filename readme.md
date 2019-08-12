# Total.js: Dev Project - REST API Service
<em>This repo is for development purpose only</em>

- download this source code then extract
- open terminal / command-line
- go inside the source directory
- install `$ npm install`
- run `$ node debug.js`
- open browser `https://127.0.0.1:8000`

## Generate SSL Key and Cert Self Signed
If you want to run with https protocol with your domain you should generate **new SSL key and cert**
```
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt
sudo chmod 644 server.key
```

## Answer Test
1. Rest API is required `x-token` header for products only
```
// choose one of these:
- d88ad6cd-1112-4fc9-a20a-6ff75ed4d2da
- 5df4b659-bc1d-4e4d-9e37-0fa2ad70f8d1
```

2. Embedded NoSQL database is on models directory

3. CRUD for product is available on `127.0.0.1:8000/api/products*`  
I have attach postman file `TotalJS.postman_collection.json`, for testing the products API.

4. CRUD is included with search feature

5. Socket test is on `127.0.0.1:8000/socket`