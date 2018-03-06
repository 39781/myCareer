var express 		= require('express');
var router			= express.Router();	 
var DialogflowApp	=	require('actions-on-google').DialogflowApp;

var serviceNowApi 	=	require('./serviceNow');
var config 			= 	require('./config');
var botResponses	=	{};
var botResponses = require('./facebook.js');
//var botResponses = require('./slack.js');
router.get('/',function(req, res){
	console.log('req received');
	res.send("req received");
	res.end();
})


router.post('/botHandler',function(req, res){
	//console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(req.body));	

	if (req.body.result||req.body.queryResult) {		
		processRequest(req, res)
		.then(function(responseJson){			
			res.status(200);
			if(typeof(responseJson)=='object'){
				console.log('responseJSON',JSON.stringify(responseJson));								
				res.json(responseJson).end();
			}else{
				res.end();
			}
		})
		.catch(function(err){
			res.status(400);
			res.json(err).end();
		})	
	} else {
		console.log('Invalid Request');
		return response.status(400).end('Invalid Webhook Request');
	}
});



processRequest = function(req, res){		
	return new Promise(function(resolve, reject){		
		console.log('generate response started',req.body.result.parameters);
		let requestSource = (req.body.originalRequest) ? req.body.originalRequest.source : undefined;	
		console.log(requestSource);
		let action = req.body.result.action; // https://dialogflow.com/docs/actions-and-parameters			
		let inputContexts = req.body.result.contexts; // https://dialogflow.com/docs/contexts	
		var sessionId = (req.body.sessionId)?req.body.sessionId:'';
		var resolvedQuery = req.body.result.resolvedQuery;	
		botResponses = require('./'+requestSource);		
		if(typeof(incidentParams[sessionId]) == 'undefined'){
			incidentParams[sessionId] = {};
		}
			
		if(typeof(incidentParams[sessionId]['recentInput'])!='undefined'){
			req.body.result.parameters[incidentParams[sessionId]['recentInput']] = resolvedQuery;
		}
		
		console.log('after recentinput',req.body.result.parameters);
		var params = Object.keys(req.body.result.parameters);		
				
		for(i=0;i<params.length;i++){
			if(req.body.result.parameters[params[i]].length<=0){
				incidentParams[sessionId]['recentInput'] = 	params[i];
				break;
			}else{
				delete incidentParams[sessionId]['recentInput'];
			}				
		}
								
		console.log(incidentParams);
		var incidentParamsKeys = Object.keys(incidentParams[sessionId]);
		
		if(action == 'trackIncident'){
			func = trackIncident;
		}else{
			func = createIncident;
		}	
		
		func(sessionId, req.body.result.parameters,0)
		.then((resp)=>{
			resolve(resp);
		})
		.catch((resp)=>{reject(resp);})
	});
}

trackIncident = function(sessionId, params, errorFlag){
	return new Promise(function(resolve, reject){
		var context = "b015d80c-f1a5-40e2-911c-fba5be4d1ae6_id_dialog_context";
		var promptMsg = "Please enter incident number"
		if(errorFlag){
			promptMsg = "Please enter valid incident number";
		}
		console.log(promptMsg);
		console.log('recentInput,',incidentParams[sessionId]['recentInput'],typeof(incidentParams[sessionId]['recentInput']));
		if(typeof(incidentParams[sessionId]['recentInput'])!='undefined'){
			console.log('incident num length',params['incidentNum'].length);
			if(params['incidentNum'].length>0){
				serviceNowApi.validateIncidentNumber(params['incidentNum'], sessionId, params)
				.then((result)=>{
					console.log('result',result);
					if(result.status){
						promptMsg = null;
						incidentParams[sessionId]['recentInput'] = 'queryParam';
						return inputPrompts(result.sessId,  result.params, promptMsg,'quickReplies', context);
					}else{
						incidentParams[sessionId]['recentInput'] = 'incidentNum';
						result.params['incidentNum']="";
						return trackIncident(result.sessId, result.params, 1);					
					}
				})
				.then((resp)=>{
					resolve(resp);
				})
				.catch((err)=>{
					console.log(err);
					resolve(botResponses.getFinalCardResponse(err,null,null));
				});
			}else{
				inputPrompts(sessionId,  params, promptMsg,'simpleText',context)	
				.then((result)=>{
					console.log('response from inputpromt',result);
					resolve(result);
				})				
				.catch((err)=>{
					resolve(botResponses.getFinalCardResponse(err,null,null));
				});
			}
		}else{
			serviceNowApi.trackIncident(params)
			.then((result)=>{
				if(typeof(result)=='object'){	
					return botResponses.getFinalCardResponse(result.msg,'trackIncident',result.params);
				}else{
					return botResponses.getFinalCardResponse(result,null,null);
				}
			})
			.then((resp)=>{
				resolve(resp);
			})	
			.catch((err)=>{
				resolve(botResponses.getFinalCardResponse(err,null,null));				
			})
		}
	})
}

createIncident = function(sessionId, params, errorFlag){	
	var context = "e0e440c1-adc7-4b94-b9cb-a22a5629d79d_id_dialog_context";
	return new Promise(function(resolve, reject){
		if(typeof(incidentParams[sessionId]['recentInput'])=='undefined'){
			serviceNowApi.createIncident(params)
			.then((result)=>{
				console.log(result);
				return botResponses.getFinalCardResponse(result,null,null);
			})
			.then((resp)=>{
				resolve(resp);
			})				
			.catch((err)=>{
				resolve(botResponses.getFinalCardResponse(err,null,null));					
			})
		}else{
			inputPrompts(sessionId,  params, null,'quickReplies', context)	
			.then((result)=>{
				console.log('response from inputpromt',result);
				resolve(result);
			})				
			.catch((err)=>{
				resolve(botResponses.getFinalCardResponse(err,null,null));
			});
		}		
	});
}

inputPrompts = function(sessionId,  params, promptMsg, promptType, context){	
	return new Promise(function(resolve, reject){			
		console.log('input prompting started', promptType, params);		
		switch(promptType){
			case 'simpleText':resolve(botResponses.simpleText(sessionId, promptMsg, params, context));break;
			case 'quickReplies':resolve(botResponses.quickReplies(sessionId, config.serviceNow[incidentParams[sessionId]['recentInput']], params, context));break;
		}					
		
	});	
}

module.exports = router;



			