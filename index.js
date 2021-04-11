const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override')

const Product = require('./models/product');
const Store = require('./models/store');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/smallStore', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!");
    }).catch(err => {
        console.log("OH NO MONGO CONNECTION ERROE!");
        console.log(err);
    })

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// Store Routes
// Skapa alltid en Store först sen lägg in dina produkter
app.get('/stores', async (req, res) => {
    const stores = await Store.find({});
    res.render('store/index', { stores});
})

app.get('/stores/new', (req, res) => {
    res.render('store/new');
})

app.get('/stores/:id', async (req, res) => {
    const store = await Store.findById(req.params.id).populate('products');
    res.render('store/show', { store: store });
})

app.delete('/stores/:id', async (req, res) => {
    const store = await Store.findByIdAndDelete(req.params.id);
    res.redirect('/stores')
})

app.post('/stores', async (req, res) => {
    const store = new Store(req.body);
    await store.save();
    res.redirect('/stores');
})

app.get('/stores/:id/products/new', async (req, res) => {
    const { id } = req.params;
    const store = await Store.findById(id);
    res.render('products/new', { categories, store });
})

app.post('/stores/:id/products', async (req, res) => {
    const { id } = req.params;
    const store = await Store.findById(id);
    const { name, price, category } = req.body;
    const product = new Product({name, price, category});
    store.products.push(product);
    product.store = store;
    await store.save();
    await product.save();
    res.redirect(`/stores/${id}`);
})



// Product Routes
const categories = ['fruit', 'vegetable', 'dairy'];

app.get('/products', async (req, res) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category: category });
        res.render('products/index', { products, category })
    } else {
        const products = await Product.find({});
        res.render('products/index', { products, category: 'All' })
    }
})

app.get('/products/new', (req, res) => {
    res.render('products/new', { categories });
})

app.post('/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`)
})

app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate('store', 'name');
    console.log(product);
    res.render('products/show', { product })

})

app.get('/products/:id/edit', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product, categories });
})

app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/products/${product._id}`)
})

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.redirect('/products');
})

app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000!");
})