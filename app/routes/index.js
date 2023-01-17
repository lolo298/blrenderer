var express = require("express");
var router = express.Router();
const { exec } = require("child_process");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const { NodeSSH } = require("node-ssh");
require("dotenv").config();
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});
// get computer state
router.get("/computer/", function (req, res, next) {
  exec("ping -c 1 " + process.env.SSH_HOST, (error, stdout, stderr) => {
    if (error) {
      res.status(500);
      state = false;
    } else if (stderr) {
      res.status(500);
      state = false;
    } else {
      res.status(200);
      state = true;
    }
    res.send({ state: state });
  });
});

// upload file
router.post("/blend", upload.single("file"), function (req, res, next) {
  const ssh = new NodeSSH();
  ssh
    .connect({
      host: process.env.SSH_HOST,
      username: process.env.SSH_USER,
      password: process.env.SSH_PASS,
    })
    .then(function () {
      ssh.putFile(req.file.path, "E:/Blender/tmp/tmp.blend").then(
        function () {
          res.status(200).send(req.file.filename);
        },
        function (error) {
          console.log(error);
        }
      );
    })
    .catch(function (err) {
      console.log(err);
    });
});

module.exports = router;
