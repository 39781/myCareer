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
				  "text": ""
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
	console.log('Dialogflow Request body: ' + JSON.stringify(req.body));	
	return findCourseName(req.body.request.intent.name.toLowerCase())
	.then((courseName)=>{
		return getCareerResponse(courseName);
	})
	.then((resp)=>{
		console.log(resp);
		plainTextResponse.response.outputSpeech.text = resp;
		res.json(plainTextResponse).end();		
	})
	.catch((err)=>{
		plainTextResponse.response.outputSpeech.text = JSON.stringify(err);
		res.json(plainTextResponse).end();
	});	
	
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



			