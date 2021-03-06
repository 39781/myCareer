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
					"text": "Can I help you with anything else?",
					"ssml":"<speak>Can I help you with anything else?</speak>",
				  }
				},
				"shouldEndSession": false
			}
		}

router.post('/botHandler',function(req, res){
	//console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(req.body));	
	console.log(req.body.request.type);
	var processRequest;
	switch(req.body.request.type){
		case 'LaunchRequest':processRequest = launchRequest;break;
		case 'IntentRequest':processRequest = intentRequest;break;
		case 'SessionEndedRequest':processRequest = sessionEndedRequest;break;
	}
	processRequest(req)
	.then((resp)=>{
		console.log(resp);
		res.json(resp).end();	
	})
	.catch((err)=>{
		res.json(err).end();
	});
	
	
});
function sessionEndedRequest(req){
	return new Promise(function(resolve, reject){	
		plainTextResponse.response.outputSpeech.text = 'Sorry, I cannot understand Try Again';
		plainTextResponse.response.outputSpeech.ssml = '<speak>Sorry, I cannot understand Try Again</speak>';
		resolve(plainTextResponse);
	});
}
function intentRequest(req){
	return new Promise(function(resolve, reject){	
		console.log(req.body.request.intent.slots.course.value);
		if(req.body.request.intent.name == 'AMAZON.CancelIntent' || req.body.request.intent.name == 'AMAZON.StopIntent'){
			plainTextResponse.response.outputSpeech.text = "Thank you for using me, good bye ";
			plainTextResponse.response.outputSpeech.ssml = "<speak>Thank you for using me, good bye</speak>";						
			plainTextResponse.response.shouldEndSession = true;
			resolve(plainTextResponse);
		}else{
			getCareerResponse(req.body.request.intent.slots.course.value.toLowerCase())
			.then((resp)=>{
				console.log(resp);
				plainTextResponse.response.outputSpeech.text = resp.text;
				plainTextResponse.response.outputSpeech.ssml = "<speak>"+resp.ssml+"</speak>";						
				resolve(plainTextResponse);		
			})
			.catch((err)=>{
				var error = JSON.stringify(err);
				plainTextResponse.response.outputSpeech.text = error;
				plainTextResponse.response.outputSpeech.ssml = "<speak>"+error+"</speak>";
				resolve(plainTextResponse);
			});	
		}
	});
}

function launchRequest(req){
	return new Promise(function(resolve, reject){
		plainTextResponse.response.outputSpeech.text = "Hai I am MyCareer Alexa bot. I can guide about your career, please tell which course you completed."
		plainTextResponse.response.outputSpeech.ssml = "<speak>Hai I am MyCareer Alexa bot. I can guide about your career, please tell which course you completed.</speak>"
		console.log(plainTextResponse);
		resolve(plainTextResponse);
	});
}

function getCareerResponse(courseName){
	return new Promise(function(resolve, reject){
			console.log(courseName);
		switch(courseName.toLowerCase()){
			case 'ssc':case 'tenth':case 'matriculation':courseName = 'ssc';break;
			case 'inter':case 'intermediate':case 'plus two':case 'plus 2':courseName = 'intermediate';break;
			case 'degree':case 'graduation':courseName = 'degree';break;
			case 'pg':case 'post graduation':courseName = 'pg';break;
		}			
		console.log(courseName);
		var keys  = Object.keys(careerConfig[courseName]);
		console.log(keys);
		var responseText = "After "+courseName+" there are several options. That are "+keys.toString()+".";
		var ssmlResponse = responseText;
		var option = 1;		
		keys.forEach(function(key){
			console
			optionsTxt = ", Option "+option+"  "+key+" "+careerConfig[courseName][key].Description;			
			if(careerConfig[courseName][key].courses){
				optionsTxt += " courses from this stream are "+careerConfig[courseName][key].courses.toString();
			}else if(careerConfig[courseName][key].jobs){
				optionsTxt += " jobs from this stream are "+careerConfig[courseName][key].jobs.toString();
			}			
			responseText += optionsTxt;
			ssmlResponse += "<break time=0.5s>"+optionsTxt+"</break>";
			console.log(ssmlResponse);
			option++;
		});		
		console.log('hari','response text',ssmlResponse);		
		resolve({text:responseText,ssml:ssmlResponse});
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



			