console.log('index.js loaded')
var computer = document.getElementById('computer');
setInterval(async function () {
    console.log(await(await fetch('/computer')).json())
},10000)