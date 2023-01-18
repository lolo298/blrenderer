filename = "";

updateConnection();
setInterval(updateConnection, 60000);
const socket = new WebSocket("ws://localhost:8080");

socket.onopen = function (e) {
  console.log("connected to server");
};

document.forms[0].addEventListener("submit", function (e) {
  e.preventDefault();
  sendFile();
});

socket.onmessage = function (event) {
  console.log("new message: ", event.data);
  if (event.data === "Transfered") {
    let img = document.getElementById("rendered");
    img.src = "/images/rendered/tmp.png?" + new Date().getTime();
    document.getElementById("modalImg").style.display = "flex";
  }
};

window.onbeforeunload = function () {
  socket.send(JSON.stringify({ "state": "close", "filename": filename }));
};

async function updateConnection() {
  var computer = document.getElementById("computer");
  var computerState = document.getElementById("computerState");
  let res = await fetch("/computer");
  let data = await res.json();
  computerState.style.fill = data.state ? "#00FF00" : "#FF0000";
  computer.innerHTML = data.state ? "Online" : "Offline";
}

async function sendFile() {
  socket.send(JSON.stringify({ "state": "reset", "filename": filename }));
  var file = document.getElementById("blend").files[0];
  var data = new FormData();
  data.append("file", file);

  filename = await fetch("/blend", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: data, // body data type must match "Content-Type" header
  });
  filename = await filename.text();
  socket.send(JSON.stringify({ "state": "render" }));
}

var drop = document.getElementById("fileSelect");
drop.addEventListener("dragenter", change, false);
drop.addEventListener("dragleave", change_back, false);
drop.addEventListener("drop", dropFile, false);
drop.addEventListener("dragover", (e) => e.preventDefault(), false);
function change() {
  drop.style.backgroundColor = "#EFF2AA";
}

function change_back() {
  drop.style.backgroundColor = "transparent";
}

function dropFile(e) {
  e.preventDefault();
  console.log(e);
  var file = e.dataTransfer.files[0];
  document.getElementById("blend").files = e.dataTransfer.files;
  document.getElementById("blend").value = file.name;
}