const puppeteer = require('puppeteer');
const fs = require("fs");
const xlsx = require("json-as-xlsx")
let pin = process.argv[2];
let age = Number(process.argv[3]);
// console.log(age);
(async () => {
  const browser = await puppeteer.launch({headless : false});
  const page = await browser.newPage();
  await page.goto('https://www.cowin.gov.in/');
//   await page.screenshot({ path: 'example.png' });
await page.waitForSelector(".mat-ripple.mat-tab-label.mat-focus-indicator.ng-star-inserted");
await page.evaluate(function(){
    let selall = document.querySelectorAll(".mat-ripple.mat-tab-label.mat-focus-indicator.ng-star-inserted");
    selall[1].click();
    return;
})
await page.waitForSelector(".pin-search input");
await page.type(".pin-search input",pin);

await page.waitForSelector(".searchBtn.pin-search-btn.accessibility-plugin-ac")
await page.evaluate(function(){
  let searchbtn = document.querySelector(".searchBtn.pin-search-btn.accessibility-plugin-ac")
  searchbtn.click();
})

await page.waitForSelector("ul label.accessibility-plugin-ac");
await page.waitForTimeout(3000);
await page.evaluate(function(age){
  let allage = document.querySelectorAll("ul label.accessibility-plugin-ac");  
if(age>=12 && age<=14){
  allage[0].click();
}else if(age>=15 && age<=18){
  allage[1].click();
}else if(age>18){
  allage[2].click();
}
    return
},age)
await page.waitForSelector(".item.active li");
await page.waitForSelector(".col-sm-12.col-md-12.col-lg-12.cvc-list-item.ng-star-inserted");
let arr = await page.evaluate(function(){
  let a = [];
  let alldays = document.querySelectorAll(".item.active li");
  let allrows = document.querySelectorAll(".col-sm-12.col-md-12.col-lg-12.cvc-list-item.ng-star-inserted");
  
  for(let i=0; i<alldays.length; i++){
    let date = alldays[i].textContent.trim();
    for(let j=0; j<allrows.length; j++){
      let name = allrows[j].querySelector(".row-disp h5").textContent.trim();
      let address = allrows[j].querySelector(".row-disp>p").textContent.trim();
      let vaccine = allrows[j].querySelector(".row-disp div p").textContent.trim();
      let age = allrows[j].querySelector(".row-disp div .session-details span").textContent.split(":")[1].trim();
      let dose = allrows[j].querySelectorAll(".row-disp div .session-details span")[1].textContent.split(":")[1].trim();
      let slot = allrows[j].querySelectorAll(".slots-box.ng-star-inserted")[i].textContent.trim();
      if(slot != "N/A" && slot != "Booked"){
      let obj = {
         Name:name,
        Address:address,
        Vaccine:vaccine,
        AgeGroup:age,
        Dose:dose,
        Slot:slot,
        Date:date 
      }
  a.push(obj);}
  }
}
 return a;
})
let vaccination = JSON.stringify(arr);
let data = [
  {
    sheet: "ScheduleOfVaccination",
    columns: [
      { label: "Name", value: "Name" }, // Top level data
      { label: "Address", value: "Address" },
      { label: "Vaccine", value: "Vaccine" },
      { label: "AgeGroup", value: "AgeGroup" },
      { label: "Dose", value: "Dose" },
      { label: "Slot", value: "Slot" },
      { label: "Date", value: "Date" },
    ],
    content: arr
 
  },
]

let settings = {
  fileName: "Schedule", // Name of the resulting spreadsheet
  extraLength: 7, // A bigger number means that columns will be wider
  writeOptions: {}, // Style options from https://github.com/SheetJS/sheetjs#writing-options
}

xlsx(data, settings) // Will download the excel file
fs.writeFileSync("ScheduleOfVaccination.json",vaccination);
console.log(vaccination);

browser.close();

})();