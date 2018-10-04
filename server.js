const express = require('express');
const bodyParser = require('body-parser');
var path 		=require('path');
var crypto = require('crypto');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3000;
const app = express();

var crfArray=[];
const csrfMiddleware = csurf({
  cookie: true
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/post', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/post.html'));
});

app.post('/login', (req, res) => {
  console.log(`Message received: ${req.body.username}`);
  	if(req.body.username=='admin' && req.body.password=='admin'){
  		var session_id=generate_key();
  		var token = jwt.sign({id:session_id}, "RANDOMSECRET", {expiresIn: '24h'});
  		crfArray.push({key:session_id,value:token})
  		console.log(crfArray);
  		res.setHeader('Set-Cookie', [`session-id=${session_id}`]);
        res.redirect('/post')

  	}else{
		res.send(`Invalid credentials`);
	}
});

app.post('/gettoken', (req, res) => {
  	var session_id = req.cookies['session-id'];

  	if(session_id!=undefined){
  		var found=false;
  		var token=false;
  		crfArray.forEach(function(element) {

			if(element.key==session_id){
				found=true;
				token=element.value;
		  	}
		});

		if(found){
			res.json({success:true,token:token})
		}else{
			res.json({success:false})
		}
	}else{
		res.json({success:false});
	}
});

app.post('/posts', (req, res) => {
    const token = req.body.token;
    const session_id = req.cookies['session-id'];
    console.log('as')
    if(session_id != undefined || token !=undefined){
    	var found=false;
    	crfArray.forEach(function(element) {
    		console.log(token)
    		if(element.key==session_id && element.value==token){
    			found=true;
    		}
    	});

    	if(found){
    		res.sendFile(path.join(__dirname + '/public/success.html'));
    	}else{
    		res.sendFile(path.join(__dirname + '/public/error.html'));
    	}
    }else{
    	res.sendFile(path.join(__dirname + '/public/error.html'));
    }

});

// app.use(cookieParser());
// app.use(csrfMiddleware);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

var generate_key = function() {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};