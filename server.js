const express = require('express');
const db = require('./db');
const path = require('path');

// 1. Create 2 app.use
const app = express(); // starts server

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    res.header('Access-Control-Allow-Methods', "*"); //allows to delete objects from the api    
    db.readJSON('./products.json') //json file can't be empty, or else server won't run
    .then(data => {
        req.products = data;
        next();
    })
    .catch(error => new Error(error))
})

// 2. Create get methods to send to client

app.get('/', (req, res) => { // for main route, use sendFile to send index.html
    res.sendFile(path.join(__dirname, './index.html'));
})

app.get('/api/products', (req, res) => { //create path for the json file to live
    res.send(req.products);
})

app.get('/api/products/:id', (req, res) => { //create path for the json file to live
    res.send({
        product: req.products.find(product => product.id === req.params.id) || null
    });
})

app.delete('/api/products/:id', (req, res) => { //create path for the json file to live
    const {id} = req.params;
    const productExist = req.products.find(product => product.id === id)

    if(!productExist){
        res.status.send(400)({
            message: 'bruh... product dont exist'
        })
    } else {
        const removedProduct = req.products.splice(req.products.indexOf(productExist),1);
        res.send(...removedProduct);
    }

    db.writeJSON('./products.json', req.products)
    .then(response => console.log(`Product id: ${id} was removed!`))
    .catch(error => console.log(error));
})

app.post('/api/products/:id', (req, res) => { //create path for the json file to live
    const {id} = req.params;
    const {name} = req.body;
    const productExist = req.products.find(product => product.name === name)
    
    if(productExist){
        res.status.send(400)({
            message: 'Product already exists!'
        })
        throw new Error('Product already exists!');
    } else {
        req.products.unshift(req.body); //push new product to the beginning of the array
        res.send(req.body); //send response to client to update state

        db.writeJSON('./products.json', req.products)
        .then(response => console.log(`Product id: ${id} name: ${name} was added!`))
        .catch(error => console.log(error));
    }
})

app.put('/api/products/:id', (req, res) => {
    const {id} = req.params;
    const {name} = req.body;
    const findProduct = req.products.find(product => product.id === id);

    if(!findProduct){
        res.status.send(400)({
            message: 'Product doesnt exist'
        })
        throw new Error('Product doesnt exist');
    } else {
        findProduct.name = name;
        req.products[req.products.indexOf(findProduct)] = findProduct;
        res.send(findProduct);
    }

    db.writeJSON('./products.json', req.products)
    .then(response => console.log(`Product id: ${id} name updated to ${findProduct.name}!`))
    .catch(error => console.log(error));
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`listening at port ${PORT}`));
