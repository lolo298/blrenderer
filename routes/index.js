var express = require('express');
var router = express.Router();
const { exec } = require("child_process");

/* GET home page. */
router.get('/', function(req, res, next) {

  exec("ping google.fr", (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
  });
  res.render('index', { title: 'Express' });
});
router.get("/computer/", function (req, res, next) {
  exec("ping google.frfd", (error, stdout, stderr) => {
    if(error) {res.status(501)}else
    if(stderr) {res.status(500)}else
    if(stdout) {res.status(200);}
    res.send({message:stdout, error:error});
    
  });
  
});
module.exports = router;
