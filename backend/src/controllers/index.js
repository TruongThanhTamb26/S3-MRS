const express = require('express');
const router = express.Router();

// Example controller function for getting all items
router.get('/items', (req, res) => {
    // Logic to retrieve items from the database
    res.send('Get all items');
});

// Example controller function for creating a new item
router.post('/items', (req, res) => {
    // Logic to create a new item in the database
    res.send('Create a new item');
});

// Export the router
module.exports = router;