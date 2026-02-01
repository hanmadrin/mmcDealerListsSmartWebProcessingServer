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
        "Vin#",
        "Year",
        "Vehicle",
        // "Make",
        // "Model",
        // "Trim",
        "Mileage",
        "Drive Train",
        "Engine Size",
        "Price$",
        "State",
        "Buy Now Price",
        "URL"
    ]
    // save data to data.csv file
    const inputCsvData = json2csv(data, {fields});
    fs.writeFileSync(path.join(__dirname, '../input.csv'), inputCsvData);

    let rawJson = await csv().fromFile(path.join(__dirname, '../input.csv'));


    const masterJson = await csv().fromFile(path.join(__dirname, '../master.csv'));

    let newJson = rawJson.filter((raw) => {
        return !masterJson.some((master) => master['Vin#'] === raw['Vin#']);
    });
    
    newJson.sort((a, b) => {
        if (a.Model === b.Model) {
            return parseFloat(a['Opening Price']) - parseFloat(b['Opening Price']);
        }
        return a.Model.localeCompare(b.Model);
    });


    const rawCount = rawJson.length;
    const newCount = newJson.length;
    console.log(rawCount, newCount);

    // save newJson to new.csv file
    const newCsv = json2csv(newJson, {fields});
    fs.writeFileSync(path.join(__dirname, '../new.csv'), newCsv);
    // return;
    await sendMail({newCsv: newCsv, rawCount, newCount});

    
    console.log('email sent')
    const rawCsv = json2csv(rawJson, {fields});
    fs.writeFileSync(path.join(__dirname, '../master.csv'), rawCsv);



    res.json({status: 'success'});
});

// default export
module.exports = router;