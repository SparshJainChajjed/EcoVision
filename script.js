let model,imageDataUrl=null;
const sampleDevices=[
  {name:"Smartphone",originalValue:"₹50,000",currentValue:"₹5,000"},
  {name:"Laptop",originalValue:"₹70,000",currentValue:"₹15,000"},
  {name:"Tablet",originalValue:"₹30,000",currentValue:"₹7,000"},
  {name:"Desktop PC",originalValue:"₹40,000",currentValue:"₹8,000"}
];
const modelStatus=document.getElementById("modelStatus");
const imageInput=document.getElementById("imageInput");
const identifyBtn=document.getElementById("identifyBtn");
const preview=document.getElementById("preview");
const resultSection=document.getElementById("resultSection");
const deviceNameEl=document.getElementById("deviceName");
const originalValueEl=document.getElementById("originalValue");
const currentValueEl=document.getElementById("currentValue");
const recycleSection=document.getElementById("recycleSection");
const optionsSection=document.getElementById("optionsSection");
const recycleBtn=document.getElementById("recycleBtn");
const skipBtn=document.getElementById("skipBtn");
const locationStatus=document.getElementById("locationStatus");
const manualLocation=document.getElementById("manualLocation");

function mapToCategory(label){
  const l=label.toLowerCase();
  if(l.includes("laptop")||l.includes("notebook"))return"Laptop";
  if(l.includes("cellular")||l.includes("mobile")||l.includes("smartphone")||l.includes("telephone")||l.includes("ipod"))return"Smartphone";
  if(l.includes("monitor")||l.includes("desktop")||l.includes("screen"))return"Desktop PC";
  if(l.includes("tablet")||l.includes("ipad")||l.includes("book jacket"))return"Tablet";
  return null;
}
function pickDeviceFor(label){
  const mapped=mapToCategory(label);
  if(mapped)return sampleDevices.find(d=>d.name===mapped);
  return sampleDevices[Math.floor(Math.random()*sampleDevices.length)];
}
async function ensureModel(){
  if(!model){
    modelStatus.textContent="Loading on-device model…";
    model=await mobilenet.load();
    modelStatus.textContent="Model ready.";
  }
}
imageInput.addEventListener("change",()=>{
  const f=imageInput.files[0];
  if(!f){preview.style.display="none";imageDataUrl=null;return;}
  const reader=new FileReader();
  reader.onload=e=>{imageDataUrl=e.target.result;preview.src=imageDataUrl;preview.style.display="block";};
  reader.readAsDataURL(f);
});
identifyBtn.addEventListener("click",async()=>{
  if(!imageDataUrl){modelStatus.textContent="Please choose an image first.";return;}
  await ensureModel();
  modelStatus.textContent="Identifying…";
  await new Promise(r=>setTimeout(r,50));
  const p=await model.classify(preview);
  const top=p&&p[0]?p[0].className:"unknown";
  const device=pickDeviceFor(top);
  deviceNameEl.textContent=device.name;
  originalValueEl.textContent=device.originalValue;
  currentValueEl.textContent=device.currentValue;
  resultSection.style.display="block";
  recycleSection.style.display="block";
  modelStatus.textContent="Done.";
});
recycleBtn.addEventListener("click",()=>{
  if("geolocation"in navigator){
    locationStatus.textContent="Detecting your location…";
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const{latitude,longitude}=pos.coords;
        locationStatus.textContent=`Location detected (${latitude.toFixed(2)}, ${longitude.toFixed(2)}).`;
        optionsSection.style.display="block";
      },
      err=>{
        locationStatus.textContent="Unable to get location. Enter city manually below.";
        manualLocation.style.display="block";
        optionsSection.style.display="block";
      }
    );
  }else{
    locationStatus.textContent="Geolocation not supported. Enter city manually below.";
    manualLocation.style.display="block";
    optionsSection.style.display="block";
  }
});
skipBtn.addEventListener("click",e=>{
  e.preventDefault();
  resultSection.style.display="none";
  recycleSection.style.display="none";
  optionsSection.style.display="none";
  preview.style.display="none";
  imageInput.value=null;
  imageDataUrl=null;
  modelStatus.textContent="Ready.";
});
