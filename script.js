// script.js
const message = "Welcome to ecognize";
const speed   = 150;            // 150 ms per character
let   i       = 0;
const el      = document.getElementById("typing");

function type() {
  if (i < message.length) {
    el.textContent += message.charAt(i++);
    setTimeout(type, speed);
  }
}

window.addEventListener("DOMContentLoaded", type);
