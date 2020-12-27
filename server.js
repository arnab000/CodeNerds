var express=  require("express")
var app=express();
var formidable = require("express-formidable");
app.use(formidable());

var mongodb = require("mongodb");
var mongoclient=mongodb.MongoClient;
var ObjectId= mongodb.ObjectId;
var http=require("http").createServer(app);
var bcrypt= require("bcrypt");
var filesystem= require("fs");
var jwt = require("jsonwebtoken");
var accessTokenSecret="fromedenwith2357";
app.use("/public", express.static(__dirname+ "/public"));
app.set("view engine","ejs");
var sockerIO=require("socket.io")(http);
var socketID="";
var user = [];
var mainURL = "http://localhost:3000";

sockerIO.on("connection",function(socket){
    console.log("Mama 1 jon ashche", socket.id);
    socketID= socket.id;

}
)
http.listen(3000,function(){
    console.log("The watch has began");
    mongoclient.connect("mongodb://localhost:27017/codenerd",{useNewUrlParser: true},function(e, client){
 
   var database= client.db("codenerd");
       console.log("database done"); 
  
    app.get("/signup",function(request,result){
        result.render("signup");
    });
    app.post("/signup",function(request,result){
       var name=request.fields.name;
       var username=request.fields.username;
       var email= request.fields.email;
       var password = request.fields.password;
       database.collection("users").findOne(
           {
               $or: [{
                   "email":email

               },{
                   "username": username
               }]
           },function(error,user){
               if(user==null)
               {
                   bcrypt.hash(password,10,function(error,hash){
                       database.collection("users").insertOne({
                           "name": name,
                           "username": username,
                           "password": hash,
                           "email":email,
                           "gender":"",
                           "profileImage":"",
                           "profession":"",
                           "School":"",
                           "College":"",
                           "University":"",
                           "Country":"",
                           "AboutMe":"",
                           "friends":[],
                           "Notification":[],
                           "posts":[]
                     },function(error,data){
                         result.json({
                             "status":"success",
                             "message": "Signed up successfully."
                         })
                     })
                   })
               }
               else{
                result.json({
                    "status":"error",
                    "message": "Nah mate, Be unique"
                })
               }

           }

       )
    });
      app.get("/login",function(request,result){
          result.render("login");
      })
      app.post("/login",function(request,result){
      
        var email= request.fields.email;
        var password = request.fields.password;
        database.collection("users").findOne({
                
                    "email":email
 
            },function(error,user){
                if(user==null)
                {
                   
                          result.json({
                              "status":"error",
                              "message": "The email does not exist "
                          })
                     
                }
                else{
                    bcrypt.compare(password,user.password,function(error,isVerify){
                        if(isVerify)
                        {
                            var accessToken=jwt.sign({email: email},accessTokenSecret);
                            database.collection("users").findOneAndUpdate({
                             "email": email
                            },
                            {
                                $set:{
                                    "accessToken":accessToken
                                }
                            },function(error,data)
                            {
                                result.json({
                                   "status" :"success",
                                   "message": "Login was succesful",
                                    "accessToken" : accessToken,
                                    "profileImage": user.profileImage
                                })
                            }
                            )
                        }
                        else{
                           result.json({
                               "status":"error",
                               "message": "Password is not correct"
                           })

                        }
                    })
                 
                }
 
            }
 
        )
     });

    });
});