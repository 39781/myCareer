var express 		= require('express');
var router			= express.Router();	 
var careerConfig	= require("./config");	

router.get('/',function(req, res){
	console.log('req received');
	res.send("req received");
	res.end();
})
var plainTextResponse = {			
			"response": {
				"outputSpeech": {
				  "type": "PlainText",
				  "text": "",
				  "ssml":""
				},
				"reprompt": {
				  "outputSpeech": {
					"type": "PlainText",
					"text": "Can I help you with anything else?"
				  }
				},
				"shouldEndSession": false
			}
		}

router.post('/botHandler',function(req, res){
	//console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
	//console.log('Dialogflow Request body: ' + JSON.stringify(req.body));	
	var jsonResp;
	switch(req.body.request.type){
		case 'LaunchRequest':jsonResp = launchRequest(req, res);break;
		case 'IntentRequest':jsonResp = intentRequest(req, res);break;
		case 'SessionEndedRequest':jsonResp = sessionEndedRequest(req, res);break;
	}
	res.json(jsonResp).end();
	
});
function sessionEndedRequest(){
}
function intentRequest(){
	return new Promise(function(resolve, reject){	
		findCourseName(req.body.request.intent.name.toLowerCase())
		.then((courseName)=>{
			return getCareerResponse(courseName);
		})
		.then((resp)=>{
			console.log(resp);
			plainTextResponse.response.outputSpeech.text = resp;
			plainTextResponse.response.outputSpeech.ssml = "<speak>"+resp+"</speak>";
			console.log(plainTextResponse);
			resolve(plainTextResponse);		
		})
		.catch((err)=>{
			var error = JSON.stringify(err);
			plainTextResponse.response.outputSpeech.text = error;
			plainTextResponse.response.outputSpeech.ssml = "<speak>"+error+"</speak>";
			resolve(plainTextResponse);
		});	
	});
}
function launchRequest(){
	return new Promise(function(resolve, reject){
		plainTextResponse.response.outputSpeech.text = "Hai I am MyCareer Alexa bot. I can guide about your career, please tell which course you completed."
		plainTextResponse.response.outputSpeech.ssml = "<speak>Hai I am MyCareer Alexa bot. I can guide about your career, please tell which course you completed.</speak>"
		resolve(plainTextResponse);
	});
}
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
			responseText += " Option "+option+" "+key+" "+careerConfig['ssc'][key].Description+" Courses from this stream are "+careerConfig['ssc'][key].courses.toString();
			option++;
		});
		console.log(responseText);		
		resolve(responseText);
		/*resolve({			
			"response": {
				"outputSpeech": {
				  "type": "PlainText",
				  "text": responseText
				},
				"reprompt": {
				  "outputSpeech": {
					"type": "PlainText",
					"text": "Can I help you with anything else?"
				  }
				},
				"shouldEndSession": false
			}
		});*/		
	})
}


module.exports = router;



			