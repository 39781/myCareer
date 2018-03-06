var express 		= require('express');
var router			= express.Router();	 
var careerConfig	= require("./config");	
router.get('/',function(req, res){
	console.log('req received');
	res.send("req received");
	res.end();
})


router.post('/botHandler',function(req, res){
	//console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(req.body));	
	findCourseName(req.body.intent.name.toLowerCase())
	.then((courseName)=>{
		return getCareerResponse(courseName);
	})
	.then((resp)=>{
		console.log(resp);
		res.json(resp).end();		
	})
	.catch((err)=>{
		
	});
	res.end();
	
});

function findCourseName(intentName){
	return new Promise(function(resolve, reject){	
		switch(intentName){
			case 'matriculation':resolve('ssc');break;
			case 'intermediate':resolve('intermediate');break;
			case 'graduation':resolve('degree');break;
			case 'postgraduation':resolve('pg');break;
			case 'diploma':resolve('diploma');break;
		}		
	});
}
function getCareerResponse(courseName){
	return new Promise(function(resolve, reject){		
		var keys  = Object.keys(careerConfig[courseName]);
		var responseText = "After SSC, there are several options. That are "+keys.toString()+".";
		var option = 1;
		keys.forEach(function(key){
			responseText += "Option "+option+" "+key+" "+careerConfig['ssc'][key].Description+" Courses from this stream are "+careerConfig['ssc'][key].courses.toString();
			option++;
		});
		console.log(responseText);		
		resolve({
			"version": "1.0",
			"sessionAttributes": {
				"supportedHoriscopePeriods": {
				  "daily": true,
				  "weekly": false,
				  "monthly": false
				}
			},
			"response": {
				"outputSpeech": {
				  "type": "PlainText",
				  "text": responseText
				},
				"card": {
				  "type": "Simple",
				  "title": "Career after SSC",
				  "content": responseText
				},
				"reprompt": {
				  "outputSpeech": {
					"type": "PlainText",
					"text": "Can I help you with anything else?"
				  }
				},
				"shouldEndSession": false
			}
		});		
	})
}


module.exports = router;



			