
module.exports.checkLogin = checkLogin;

function checkLogin(model,uname,key,response,request){
      
    model.find({username: uname},(err,found)=>{
        if(err){console.log(err);}
        else if(found.length==0){
           response.render('login',{status: "plz register shit"});
        }
        else{
            if(key!=found[0].password){
                response.render('login',{status: "wrong password"});
            }
            else{
                request.session.user=found;
                response.redirect('/user');
                //console.log("session: "+request.session.user);
                
            }
        }

    });
}

module.exports.register = register;

function register(model,uname,key,response,request){

    model.find({username: uname},(err,found)=>{
        if(err){console.log(err);}
        else if(found.length!=0){
            response.render('signup',{status: 'User already exist'});
        }
        else{
            model.insertMany({username: uname, password: key},(err,doc)=>{
                if(err){console.log(err);}
                else{
                    request.session.user=doc;
                    response.redirect('/user');
                    //console.log("session: "+request.session.user);
                }
                
            })
        }
    });

 
}