require('dotenv').config();
const express=require("express");
const app=express();
const bodyparser=require("body-parser");
const ejs=require("ejs")
const mongoose=require("mongoose");
var stripe=require('stripe')('sk_test_51KKGYLSJY5jGZ1U6CB3P2pYYDzQd9CLtQfRrq0QfXIy7JBlGif4rpWih0XOJN5k2kL9dhT0vq3Rzr9KHpCLUrw9900Qm1SC8CI');
var Publishable_Key = 'pk_test_51KKGYLSJY5jGZ1U6Faj9ROrEStt3NI2qncthXP5P8AduYGeOp3Me8N1iVWhfgErk6t6hzvpkheCtM7neFuuClYF600xTSUEeyr'
const multer=require("multer");
const path=require("path")
const fs = require('fs');
const directoryPath = path.join(__dirname +'/public/upload');
const directoryPath1 = path.join(__dirname +'/public/upload1');
const directoryPath2 = path.join(__dirname +'/public/upload2');
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findorcreate=require("mongoose-findorcreate")
const ejsLint = require('ejs-lint');
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));


app.use(session({
    secret:"our secret.",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema= new mongoose.Schema({
    email:String,
    password:String,
    googleId:String,
    secret:String,
    dash:String


})
const dashboardSchema={
    username:String,
    count:Number,
}
var verSchema={
	email:String,
    desc:String,
	flag:Boolean,
}
var imageSchema = new mongoose.Schema({
    name: String,
    desc: String,

    img:
    {
        data: Buffer,
        contentType: String
    }
});
const Dashboard=mongoose.model("Dashboard",dashboardSchema);
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findorcreate);
const User = new mongoose.model("User",userSchema);
const Verify=mongoose.model('Verify',verSchema);
const image=mongoose.model('image',imageSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  })
  var storage5=multer.diskStorage({
	destination:(req,file,cb)=>{
		cb(null,'uploads')
	},
	filename:(req,file,cb)=>{
cb(null,file.fieldname+"-"+Date.now())
	}
});
var upload=multer({storage: storage5})
// userSchema.plugin(encrypt, {secret:process.env.SECRET,encryptedFields:["password"] });
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:80/auth/google/home1",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
var email=""
var zl=[];
var imgArray = [];
var imgArray1 = [];
var imgArray2 = [];
var title1=[];

var das=[];
app.get("/",(req,res)=>{
    res.render("home" ,{link:zl ,he:imgArray});
})
app.get("/teacherup",(req,res)=>{
	image.find({},(er,cd)=>{
		if(er) console.log(er)
		else{
			res.render("teacherup",{item:cd})
		}
	})
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));
  app.get('/auth/google/home1',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home1');
  })
  app.get("/home1",(req,res)=>{
    res.render("home1",{link:zl ,he:imgArray})
  })
app.get('/verified',(req,res)=>{
    Verify.find({flag:true},(er,cd)=>{
        if(er) console.log(er)
        else{

            res.render("verified",{data:cd})

        }
    })


    // res.render("verified")
})
  var email1="";
app.post('/payment', function(req, res){

    // Moreover you can take more details from user
    var obj=new Dashboard({
        username:email1,
        count:0
    })

obj.save();
  res.redirect('/videof')
})

app.post('/payment2', function(req, res){

    // Moreover you can take more details from user
    res.redirect('/videof');
})
var pr="";
app.post('/done',(req,res)=>{
  console.log(pr);
  console.log(email);
    Dashboard.findOne({username:email},(err,doc)=>{
        if(err){
            console.log(err);
        }else{
            if(doc){
                doc.count=doc.count+1;

                pr=doc.count;
                doc.save();

                res.redirect("/videof");
            }
        }
    })

})

app.get("/registe",(req,res)=>{
    res.render("registlog")
})

  app.get("/login",(req,res)=>{
res.render("login")
})
app.get("/register",(req,res)=>{
    res.render("register")
})
// app.get("/secrets",(req,res)=>{
//   User.find({"secret": {$ne: null}},(er,fd)=>{
//       if(er){
//           console.log(er);
//       }else{
//           if(fd){

//               res.render("secrets",{userWithsecrets : das})
//           }
//       }
//   })
// })
app.post("/register",(req,res)=>{
User.register({username:req.body.username},req.body.password,(er,fd)=>{
    if(er){
        console.log(er);
    }else{
        passport.authenticate("local")(req,res,()=>{
            res.redirect("/")
        })
    }
})

})
app.post("/pic",upload.single('image'),(req,res,next)=>{
	var pbj=new image({
		name:req.body.name,
		desc:req.body.desc,
		flag:false,
		img:{
			data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.file.filename)),
		contentType:'image/png'
		}
	})
	// pbj.save();
	pbj.save();
	var post=new Verify({
		email:req.body.name,
        desc:"",
		flag:false,
	})
	post.save();
	res.redirect("/teacherup");
})
app.get("/admin",(req,res)=>{
    res.render("admin")
})
app.get('/dash',(req,res)=>{
	image.find({},(er,cd)=>{
		if(er) console.log(er)
		else{
			res.render("dash",{item:cd})
		}
	})
})
app.post('/check',(req,res)=>{
	const name=req.body.name;
	Verify.findOne({email:name},(er,cd)=>{
		if(er) console.log(er)
		else{
			cd.flag=true;
			cd.save();
			// res.redirect('/dash')
		}
	})
    image.findOneAndDelete({email:name},(er,cd)=>{
if(er) console.log(Er);
else{
    res.redirect('/dash')
}
    })

})

app.post('/teacher',(req,res)=>{
	 email=req.body.email;
	const password=req.body.password;
	console.log(email);
	Verify.findOne({email:email},(err,data)=>{
		if(err){
			console.log(err);
		}
		else{
			console.log(data.flag)
			if(data.flag){
				// res.redirect('/up');
				console.log('verified')
                res.redirect('/admin')
			}else{
				console.log("not verified");
				// res.render('/teacher')
			}
		// 	if(data.flag==false){
		// 	res.redirect('/tl');
		// }else{
		// 	res.redirect('/book');

		// }
	}
})
})
app.get('/instlogin',(req,res)=>{
	res.render('instlogin')
})
app.post("/getlink",(req,res)=>{
    const a=req.body.zoom;

    zl.push(a)
    res.render("home1",{link:zl ,he:imgArray})


})
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/")
})
app.post("/login",(req,res)=>{
    const user= new User({
        username:req.body.username,
        pass:req.body.password
    })
    email=req.body.username;
    email1=req.body.username;
    req.login(user,(er)=>{
        if(er){
        console.log(er);
        }else{
            passport.authenticate("local")(req,res,()=>{
                res.render("home1" ,{link:zl,he:imgArray})
            })
        }
    })
})
app.get("/submit",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("submit")
    }else{
        res.redirect("/login")
    }
})
app.get("/dashboard",(req,res)=>{
    User.find({"secret": {$ne: null}},(er,fd)=>{
        if(er){
            console.log(er);
        }else{
            if(fd){

                res.render("dashboard",{ userWithsecrets : fd})
            }
        }
    })
})
app.post("/s",(req,res)=>{
    const su=req.body.dash;
    User.findById(req.user.id,(er,fd)=>{
        if(er){
            console.log(er);
        }else{
            if(fd){
                fd.dash=su;
                fd.save(()=>{
res.redirect("/dashboard")
                })
            }
        }
    })

})
app.get("/video",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("video" ,{he:imgArray,he1:imgArray1,he2:imgArray2,link:zl,key:Publishable_Key})
    }else{
        res.redirect("/")
    }
})
app.get("/videof",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("video1" ,{he:imgArray,link:zl,tt:title1,h:pr})
    }else{
        res.redirect("/")
    }
})
app.get("/video1",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("video2" ,{he1:imgArray1,link:zl})
    }else{
        res.redirect("/")
    }
})
app.get("/video2",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("video3" ,{he2:imgArray2,link:zl})
    }else{
        res.redirect("/")
    }
})
app.get("/ide",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("ise")
    }else{
        res.redirect("/")
    }
})
app.get("/gyan",(req,res)=>{
    res.render("gyan")
  })
app.get("/red",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("/registe")
    }
})
app.post("/submit",(req,res)=>{
    const sc=req.body.secret;
    console.log(req.user);

    User.findById(req.user.id , (err,founduser)=>{
        if(err){
            console.log(err);
        }else{

            if(founduser){
                founduser.secret=sc;
                founduser.save(()=>{
                    res.redirect("/secrets")
                })
            }
        }
    })

})


var Storage=multer.diskStorage({
    destination:"./public/upload/",
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
})

var Storage1=multer.diskStorage({
    destination:"./public/upload1/",
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
})

var Storage2=multer.diskStorage({
    destination:"./public/upload2/",
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
})
var upload=multer({
    storage:Storage
}).single('file')

var upload1=multer({
    storage:Storage1
}).single('file')
var upload2=multer({
    storage:Storage2
}).single('file')

app.post('/upload',upload,function(req,res,next){
    var success=req.file.fieldname+"uploaded succesfuly";
    res.redirect("/")
   })
   fs.readdir(directoryPath, function (err, files) {
       //handling error
       if (err) {
           return console.log('Unable to scan directory: ' + err);
       }
       //listing all files using forEach
       files.forEach(function (file) {
           // Do whatever you want to do with the file
        imgArray.push(file);
        console.log(file);
       //    const stat = fs.lstatSync(path.join(__dirname, 'upload'))
       // //    console.log(stat);
       // ff.push(stat)

       });
   });
   app.post('/upload1',upload1,function(req,res,next){
    var success=req.file.fieldname+"uploaded succesfuly";
    var b=req.body.title;
    var d=req.body.desc;
    console.log(b)
    title1.push(b);
    Verify.findOneAndUpdate({email:email},{$set: { desc:d}}, {new: true}, (err, doc)=>{
        if(err) console.log(err);
        else{
          res.redirect('/admin')
            // cd.save();
        }
    })


   })
   fs.readdir(directoryPath1, function (err, files) {
       //handling error
       if (err) {
           return console.log('Unable to scan directory: ' + err);
       }
       //listing all files using forEach
       files.forEach(function (file) {
           // Do whatever you want to do with the file
        imgArray1.push(file);
        console.log(file);
       //    const stat = fs.lstatSync(path.join(__dirname, 'upload'))
       // //    console.log(stat);
       // ff.push(stat)

       });
   });
   app.post('/upo',(req,res)=>{
       Verify.find({_id:req.body.ui},(er,cd)=>{
           if(er) console.log(er);
           else{
               res.render("details",{data:cd})
           }
       })
   })
   app.post('/upload2',upload2,function(req,res,next){
    var success=req.file.fieldname+"uploaded succesfuly";
    res.redirect("/admin")
   })
   fs.readdir(directoryPath2, function (err, files) {
       //handling error
       if (err) {
           return console.log('Unable to scan directory: ' + err);
       }
       //listing all files using forEach
       files.forEach(function (file) {
           // Do whatever you want to do with the file
        imgArray2.push(file);
        console.log(file);
       //    const stat = fs.lstatSync(path.join(__dirname, 'upload'))
       // //    console.log(stat);
       // ff.push(stat)

       });
   });
app.listen(80,()=>{
    console.log("succes");
})
