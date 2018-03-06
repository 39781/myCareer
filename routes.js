var express 		= require('express');
var router			= express.Router();	 

router.get('/',function(req, res){
	console.log('req received');
	res.send("req received");
	res.end();
})


router.post('/botHandler',function(req, res){
	//console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(req.body));	
	res.end();
	
});




module.exports = router;



			