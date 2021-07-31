var express = require('express');
var router = express.Router();
const fs = require('fs');

/* status check */
router.get('/user', function (req, res, next) {
  res.json({"status": "running"});
});

/* GET entire data. */
router.get('/user/all', function (req, res, next) {
  fs.readFile(__dirname + '/' + 'data.json', 'utf8', (err, data) => {
    res.json(JSON.parse(data));
  });
});


// Get filtered data
router.get('/user/:userId', function (req, res, next) {
  const id = parseInt(req.params.userId);
  fs.readFile(__dirname + '/' + 'data.json', 'utf8', (err, data) => {
    for (let user of JSON.parse(data)) {
      if (user.id === id) {
        res.json(user);
        return;
      }
    }
    res.json({"message": "No such user exits"});
  });
});

module.exports = router;
