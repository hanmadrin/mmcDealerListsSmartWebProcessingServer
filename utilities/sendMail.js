const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();
const json2csv = require('json2csv').parse;

// const processGmail = async({data,counts}) => {
//     const {data} = req.body;
//     // send gmail
//     const result = await sendMail({data});
    
// };
const auth = {
    type: "OAuth2",
    user: "hanurrad@gmail.com",
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
};
const usTimeString = () => {
    const date = new Date();
    return date.toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
};

const sendMail  = async ({newCsv,fields,rawCount,newCount})=>{
    const formatDateToAmerican = ()=>{
        const americanTime = new Date(new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}));
        let month = '' + (americanTime.getMonth() + 1);
        let day = '' + americanTime.getDate();
        let year = americanTime.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    }
    const usTimeInHalfHour = ()=>{
        // 12 hour format
        const americanTime = new Date(new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}));
        let hours = americanTime.getHours();
        let minutes = americanTime.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        // half hour time
        if(minutes >= 30){
            minutes = '30';
        }else{
            minutes = '00';
        }
        return `${hours}:${minutes}${ampm}`;
    }
    const to = [
        'michael@matthewsmotorcompany.com',
        'jason@matthewsmotorcompany.com',
        'josh@matthewsmotorcompany.com',
        'hashon.code@gmail.com',
        // 'mdhasanmahmudrimon@gmail.com'
    ]
    
    const mailoptions = {
        from: "Hasan <hanurrad@gmail.com>",
        to: to.join(','),
        subject: `Smart Lists Processing - ${formatDateToAmerican()}-${usTimeInHalfHour()}`,
    }
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            ...auth,
            accessToken: accessToken,
          },
        });
    
        const mailOptions = {
          ...mailoptions,
          text: `${rawCount} raw records and ${newCount} after deduping. Please see the attached CSV file for details.`,
            attachments: [
                {
                    filename: `${formatDateToAmerican()}-${usTimeInHalfHour()}.csv`,
                    content: newCsv        
                }
            ],
        };
    
        const result = await transport.sendMail(mailOptions);
        return {
            status: 'success',
            data: result
        };
      } catch (error) {
        console.log(error)
        throw new Error(error);
        return {
            status: 'error',
            data: error
        }
      }
}
const oAuth2Client = new google.auth.OAuth2(
    auth.clientId,
    auth.clientSecret,
    auth.redirectUri
);
oAuth2Client.setCredentials({ refresh_token: auth.refreshToken });


module.exports = {
    sendMail
};