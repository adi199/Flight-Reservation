var express = require('express');
var app = express();

app.set('view engine','ejs');
app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//database connection
var mysql = require('mysql');
var con = mysql.createConnection({
  host : "localhost",
  user : "root",
  password : "password"
});
con.connect(function(err){
  if(err) throw err;
  console.log("Database Connected");
});

//Login
var username = 0;
var userno = 0;
app.get('/', function(req,res){
  res.sendFile('login.html',{root:'.'});
  app.post('/login',function(req,res){
    username = req.body.username;
    var password = req.body.password;
    con.query("select * from hotel.passcode",function(err,result,fields){

      for(var i=0;i<result.length;i++)
      {
        if(result[i].username==username)
        {
          if(result[i].password==password)
          {
            userno = result[i].no;
            res.sendFile('htmlproject.html',{root:'.'});
          }
          else {
            res.send("Worng password");
          }
        }
      }
    })
  })
});

//login
app.get("/login.html",function(req,res){
  res.sendFile('login.html',{root:'.'});
  //req.session.destroy();
});

//Sign up
app.get("/signup.html",function(req,res){
  res.sendFile('signup.html',{root:'.'});
  app.post("/submit",function(req,res){
    var cname = req.body.name;
    var emailid = req.body.emailid;
    var no = req.body.no;
    var password = req.body.password;
    con.query("insert into hotel.customer(cname,no,emailid) values (\""+cname+"\","+no+",\""+emailid+"\");",function(err,result,fields){if(err) throw err;});
    con.query("insert into hotel.passcode values (\""+cname+"\",\""+password+"\","+no+");",function(err,result,fields){if(err) throw err;});
  });
});

//search
app.post("/search",function(req,res){
  var place = req.body.place;
  var checkin = req.body.check_in;
  var checkout = req.body.check_out;
  var type = req.body.type;
  con.query("SELECT * FROM hotel.hotels where city=\""+place+"\" and status=\"no\" and type=\""+type+"\"",function(err,result,fields){

  var i=0;
    if(err) throw err;
    else {
      {
        if(result.length == 0)
        {
          res.render('booked',{text : "No hotels available"});
        }
        else
        {
          res.render('find',{data : result,checkin : checkin,checkout : checkout});
        }
      }
    }
  });
});

app.post("/booked",function(req,res){
  var name = req.body.hname;
  var place = req.body.city;
  var room = req.body.room;
  var price = req.body.price;
  var type = req.body.type;

  con.query("UPDATE hotel.hotels SET status = \"yes\" WHERE hname = \""+name+"\" AND city = \""+place+"\";",function(err,result,fields){
    if(err) throw err;
    res.render("booked",{text : "Hotel is Booked"});
  });
  con.query("INSERT INTO hotel.payment VALUES ("+userno+",\'hotel payment\',"+price+",\'"+name+"\');",function(err,results,field){
    if(err) throw err;

  });
});

//Home Page
app.get("/htmlproject.html",function(req,res){
  res.sendFile('htmlproject.html',{root:'.'});
});
//About
app.get("/about.html",function(req,res){
    con.query("select customer.cname,customer.no,payment.desc,payment.amount,payment.hname from hotel.customer, hotel.payment where customer.no = payment.no and cname=\""+username+"\";" ,function(err,result,field){
    var i = 0;
    if(err) throw err;
    else {
            res.render('index',{data:result,test:"This is shit"});
            console.log(result);
        }
  });
});

var server = app.listen(5000,function(){
  console.log('server is up');
});
