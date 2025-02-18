// routes
const express = require('express');
const router = express.Router();
const csv = require('csvtojson');
const json2csv = require('json2csv').parse;
const { sendMail } = require('../utilities/sendMail');
// fs sync read and write
const fs = require('fs');
const path = require('path');


router.post('/processData', async (req, res) => {
    const {data} = req.body;
    // console.log(data);
    const fields = [
        "VIN",
        "Year",
        "Make",
        "Model",
        "Trim",
        "Mileage",
        "Opening Price",
        "Buy Now Price",
        "Vehicle Link"
    ]
    // save data to data.csv file
    const inputCsvData = json2csv(data, {fields});
    fs.writeFileSync(path.join(__dirname, '../input.csv'), inputCsvData);
    // const newCsv = json2csv(newJson, {fields});
    // fs.writeFileSync(path.join(__dirname, '../new.csv'), newCsv);
    // read data.csv file to json
    let rawJson = await csv().fromFile(path.join(__dirname, '../input.csv'));
    // let rawJson = data;
    // console.log(rawJson[0]['Buy Now Price']);

    // res.json({status: 'success'});
    // return;


    const masterJson = await csv().fromFile(path.join(__dirname, '../master.csv'));
    // const filteredOutJson = await csv().fromFile(path.join(__dirname, '../filteredOut.csv'));

    // dedup against masterJson field VIN
    let newJson = rawJson.filter((raw) => {
        return !masterJson.some((master) => master.VIN === raw.VIN);
    });
    // filter "Due Location Name" that starts with Auction/AUCTION/auction
    // newJson = newJson.filter((raw) => {
    //     return !raw['Due Location Name'].toLowerCase().startsWith('auction');
    // });
    
    // filter "Buy Now Price" is "0.00"
    // newJson = newJson.filter((raw) => {
    //     return raw['Buy Now Price'] !== '0.00';
    // })


    // dedup against filteredOutJson field VIN
    // let newFilteredOutJson = rawJson.filter((raw) => {
    //     return !filteredOutJson.some((filteredOut) => filteredOut.VIN === raw.VIN);
    // });
    // newFilteredOutJson = newFilteredOutJson.filter((raw) => {
    //     return raw['Due Location Name'].toLowerCase().startsWith('auction');
    // });
    // newFilteredOutJson = newFilteredOutJson.filter((raw) => {
    //     return raw['Buy Now Price'] === '0.00';
    // });
    // // ADD usa date and time column on filteredOutJson
    // newFilteredOutJson = newFilteredOutJson.map((raw) => {
    //     const date = new Date();
    //     const usaDate = date.toLocaleDateString('en-US');
    //     const usaTime = date.toLocaleTimeString('en-US');
    //     return {'Time Stamp': `${usaDate} ${usaTime}`,...raw};
    // });

    // const filteredOutFields = [
    //     "Time Stamp",
    //     ...fields
    // ];




    // save newFilteredOutJson to filteredOut.csv file
    // const newMasterFilteredOutJson = [...filteredOutJson, ...newFilteredOutJson];
    // const newFilteredOutCsv = json2csv(newMasterFilteredOutJson, {fields: filteredOutFields});
    // fs.writeFileSync(path.join(__dirname, '../filteredOut.csv'), newFilteredOutCsv);
    


    // sort by "Model" and "Buy Now Price"
    newJson.sort((a, b) => {
        if (a.Model === b.Model) {
            return parseFloat(a['Buy Now Price']) - parseFloat(b['Buy Now Price']);
        }
        return a.Model.localeCompare(b.Model);
    });


    const rawCount = rawJson.length;
    const newCount = newJson.length;
    console.log(rawCount, newCount);

    // save newJson to new.csv file
    const newCsv = json2csv(newJson, {fields});
    fs.writeFileSync(path.join(__dirname, '../new.csv'), newCsv);

    await sendMail({newCsv: newCsv, rawCount, newCount});
    console.log('email sent')
    // filer ot raw json buy no 
    // rawJson = rawJson.filter((raw) => {
    //     return raw['Buy Now Price'] !== '0.00';
    // });
    // auction
    // rawJson = rawJson.filter((raw) => {
    //     return !raw['Due Location Name'].toLowerCase().startsWith('auction');
    // });
    // save newJson to master.csv file
    // const newMasterJson = [...masterJson, ...newJson];
    // const newMasterCsv = json2csv(newMasterJson, {fields});
    const rawCsv = json2csv(rawJson, {fields});
    fs.writeFileSync(path.join(__dirname, '../master.csv'), rawCsv);

    // csv to json


    res.json({status: 'success'});
    // const result = await sendMail({data});
    // res.json(result);
});

// default export
module.exports = router;