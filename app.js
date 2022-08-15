const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const https = require("https");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const app = express();


app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    let topicArray = [25, 329, 350, 531, 552, 30530, 30533, 551];
        let topicId = 531;
        setInterval(() => topicId = topicArray[Math.floor(Math.random()*topicArray.length)], 3600 * 1000 * 24);
    if(topicArray.indexOf(topicId) === -1){
        var url = "https://health.gov/myhealthfinder/api/v3/topicsearch.json?TopicId=30530";
    } else {
        var url = "https://health.gov/myhealthfinder/api/v3/topicsearch.json?TopicId="+topicId;}
    https.get(url, (response) => {
        response.setEncoding('utf8');
        let json = '';
        response.on('data', function (data) {
        json += data;
        let healthData = json;
        try {
            healthData= JSON.parse((healthData));
            let image = healthData.Result.Resources.Resource[0].ImageUrl;
            let imageAlt = healthData.Result.Resources.Resource[0].ImageAlt;
            let title = healthData.Result.Resources.Resource[0].Title;
            let content = healthData.Result.Resources.Resource[0].Sections.section[0].Content;
            let readMore = healthData.Result.Resources.Resource[0].AccessibleVersion;
            
            let date = new Date().toLocaleDateString();
            res.render("index", {date: date, content: content, image: image, imageAlt: imageAlt, title: title, readMore: readMore});
            } catch (err) {
            // 👇️ SyntaxError: Unexpected end of JSON input
            console.log('error', err);
            }              
        });   
           
    });
            
});

app.post("/", (req, res) => {
    let first_name = req.body.fname;
    let email = req.body.email;

    mailchimp.setConfig({
        apiKey: "34d97645034518476903795da02b06d0",
        server: "us14"
        });
    
        const listId = "c3d5ee7fc7";
        const subscribingUser = {
        first_name: first_name,
        email: email
        };
        
        async function run() {
        try {const response = await mailchimp.lists.addListMember(listId, {
            email_address: subscribingUser.email,
            status: "subscribed",
            merge_fields: {
            FNAME: subscribingUser.first_name,
            }
        });
    } catch(error){
        console.log(error);
    }
       
    console.log("Successfully added contact as an audience member.");
    if (res.statusCode === 200) {
        res.render("success");
    } else {
        res.render("failure");
    }
}
run(); 
})

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/contact", (req, res) => {
    res.render("contact");
});


app.listen(3000, () => {
    console.log("app is listening on port 3000");
})

