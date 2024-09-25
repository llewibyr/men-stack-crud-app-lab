
//Imports
const express = require('express'); // library
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const Item = require('./models/Item');
require('dotenv').config();

// App + Configurations
const app = express();
const PORT = process.env.PORT || 3000;
//Middleware
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, ('views')));

// Connecting to Mongoose
 mongoose.connect(process.env.MONGODB_URI);
 mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
 });
 mongoose.connection.on('error', (err) => {
    console.log(err);
 });

 mongoose.connection.on('disconnected', () => {
    console.log('disconnected from MongoDB');
 });
// Route(Calling)
app.get('/items/new', (req, res) => {
    res.render('new');
});

// Test Route
app.get('/landing', (req, res) => {
    res.render('landing');
});

// Route (Item Creation)
app.post('/items', async (req, res) => {
    try{
        const newItem = new Item({
            name: req.body.name,
            quantity: req.body.quantity,
            description: req.body.description
        });
        await newItem.save();
        res.redirect('/items');
    } catch (err) {
        res.status(400).send('Error saving item'); 
    }
});

// Route (Lists Items)
app.get('/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.render('items/index', {items});
    } catch (err) {
        res.status(500).send('Error getting items');
    }
});

// Routes (Edit and Update)
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.get('/items/:id/edit', async(req, res) => {
    try{
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).send('Item not found');
        }
        res.render('items/edit', { item });
    } catch (err) {
        res.status(500).send('Error getting item');
    }
});

app.put('/items/:id', async (req, res) => {
  try{
        const updateItem = await Item.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            quantity: req.body.quantity,
            description: req.body.description
        },
    { new: true}
);
if (!updateItem) {
    return res.status(404).send('Item not found');
    }
    res.redirect('/items');
  } catch (err) {
    res.status(400).send('Error updating item');
  }
});

// Delete Route
app.delete('/items/:id', async  (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.redirect("/items");
    } catch (err){
        console.log(err);
        res.redirect(`/`);
    }
});

// Server Listener
app.listen(3000, () => {
    console.log(`Listening on port ${3000}`)
})