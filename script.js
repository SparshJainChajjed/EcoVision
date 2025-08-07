const imageInput = document.getElementById("imageInput");
const uploadBtn  = document.getElementById("uploadBtn");
const preview    = document.getElementById("preview");
const result     = document.getElementById("result");
const options    = document.getElementById("options");

uploadBtn.addEventListener("click", () => {
  const file = imageInput.files[0];
  if (!file) return alert("Select an image");
  const reader = new FileReader();
  reader.onload = () => preview.innerHTML = `<img src="${reader.result}">`;
  reader.readAsDataURL(file);

  const data = new FormData();
  data.append("image", file);
  fetch("/api/detect", { method: "POST", body: data })
    .then(res => res.json())
    .then(d => {
      result.innerHTML = `
        <p>Item: <strong>${d.itemName}</strong></p>
        <p>Original Value: ₹${d.originalValue}</p>
        <p>Current Value: ₹${d.currentValue}</p>
        <p>Recycle?</p>
      `;
      options.innerHTML = `
        <button id="freeBtn">Free via NGO</button>
        <button id="moneyBtn">Recycle for Money</button>
      `;
      document.getElementById("freeBtn")
        .addEventListener("click", () => handleRecycle("ngo"));
      document.getElementById("moneyBtn")
        .addEventListener("click", () => handleRecycle("money"));
    });
});

function handleRecycle(type) {
  options.innerHTML = "<p>Locating services...</p>";
  navigator.geolocation.getCurrentPosition(p => {
    fetch(`/api/services?type=${type}&lat=${p.coords.latitude}&lon=${p.coords.longitude}`)
      .then(res => res.json())
      .then(d => {
        if (type === "ngo") {
          options.innerHTML = "<p>NGO donation options:</p>" +
            d.services.map(s => `<p><a href="${s.link}" target="_blank">${s.name}</a></p>`).join("");
        } else {
          options.innerHTML = "<p>Recycling companies:</p>" +
            d.services.map(s => `<p><a href="${s.link}" target="_blank">${s.name}</a> – ₹${s.price}</p>`).join("");
        }
      });
  }, () => {
    options.innerHTML = "<p>Unable to get location</p>";
  });
}
