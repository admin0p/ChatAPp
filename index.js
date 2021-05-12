const express=require('express');
const app=express();
//socket.io
const server=require('http').createServer(app);
const {Server}=require("socket.io");
const io= new Server(server);
//Socket.io
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const session=require('express-session');
const { Socket } = require('dgram');
const auth=require(__dirname+"/auth.js");

let room=[];


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true});

const userSchema=mongoose.Schema({
    username: String,
    password: String
});

const User=new mongoose.model('user',userSchema);

//===================================================================================
//app.set
app.set('view engine','ejs');

//app.use
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: "shit is strong",resave: false, saveUninitialized: false}));
//--------------------------------------------------------------------------------------
//app.get
app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/login',(req,res)=>{
    res.render('login',{status: " "});
});

app.get('/signup',(req,res)=>{
    res.render('signup',{status: " "});
});
app.get('/user',(req,res)=>{
    if(req.session.user){
        var uname=req.session.user[0].username;
        User.find({username: {$ne: uname} } ,(err,found)=>{
            if (err){console.log(err);}
            else{
                res.render('user',{name: found});
            }
           
        });
        
       
    }
    else{
        res.status(401);
        res.send('error 404 page not found ');
    }
});

app.get('/message/:userName',(req,res)=>{
    let channel;
    const toUser=req.params.userName;
    if(req.session.user){
       const current=req.session.user[0].username;
       res.render('chat',{toUser: toUser, me: current});
        //check sockets
        //=======================================================
       io.once('connection',(socket)=>{
        socket.on('join-room',(userRoom,obj)=>{
            if(Object.keys(room).length==0){
                //create a room of username
                room[userRoom]=obj;
                channel=userRoom
            }
            else if((room[obj.to])&&(room[obj.to].to==userRoom)){
               // console.log('joining room of :'+obj.to);
                channel=obj.to;
            }
            else{
                room[userRoom]=obj;
                channel=userRoom   
            }
            
            socket.join(channel);
            io.to(channel).emit('room-joined',channel+" joined");
            socket.on('chat-msg',(data)=>{
               
                socket.to(channel).emit('chat-msg',data);
            });
        });
           io.on('disconnet',()=>{
               console.log('user disconnected');
           });
       });
       //--------------------------------------------------------
   }
else{
    res.status(401);
        res.send('error 404 page not found ');
}
    
});



app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{console.log('session killed: '+req.session)});
    res.redirect('/login');
});

//-------------------------------------------------------------------------------------
//app.posts
app.post('/login',(req,res)=>{
    var uname=req.body.username;
    var key=req.body.password;
    auth.checkLogin(User,uname,key,res,req);
    //console.log(req.session.user);
});

app.post('/signup',(req,res)=>{
   var uname=req.body.username;
   var key=req.body.password;
   auth.register(User,uname,key,res,req);
  
});
//========================================================================================



//========================================================================================
//app.listen
server.listen(3000,(err)=>{
  if(err){
      console.log(err);
  }
    else{
        console.log('server running');
    }
});