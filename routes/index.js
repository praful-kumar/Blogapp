const express = require('express');
const router = express.Router();
var userModel = require('./users');
var postModel = require('./posts')
const passport = require('passport');
const passportLocal = require('passport-local');
const flash = require('express-flash');
const multer = require('multer');

/**-----------multer---------- */
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/Uploads')
  },
  filename: function (req, file, cb) {
    var date = new Date();
    var filename = date.getTime() +file.originalname;
    cb(null, filename)
  }
})
 
var upload = multer({ storage: storage });
/**--------------------------------- */






passport.use(new passportLocal(userModel.authenticate()));

/* GET home page. */

router.get('/', function(req, res, next){
  if(req.isAuthenticated()){
    postModel.findRandom({},{},{limit: 3, populate: 'author'},function(err, results){
      if(!err){
        res.render('index',{loggedIn: true, results:results});
      }
    });
  }
  else{
    postModel.findRandom({},{},{limit: 3, populate: 'author'}, function(err, results){
      if(!err){
        res.render('index',{loggedIn:false, results:results});
      }
    });
  }
});

/**-----------login Rout------------- */

router.get('/login',redirectToProfile,function(req, res) {
  res.render('login')
})
router.get('/register', function(req, res) {
  res.render('register')
})
 /* userRegisteration in server*/
router.post('/reg', function(req, res){
  var newUser= new userModel({
    name: req.body.name,
    email:req.body.email,
    username : req.body.username
  });
  userModel.register(newUser, req.body.password)
  .then(function(registerUser){
    passport.authenticate('local')(req ,res,function(){
      res.redirect('/profile');
    });
  })
});

/*Login_User */
router.post('/login', passport.authenticate('local',{
  successRedirect: '/profile',
  failureRedirect: '/login'
}), function(userLogin){});

/*profile router rendering */
router.get('/profile',isLoggedIn ,function(req, res){
  userModel.findOne({username:req.session.passport.user})
  .populate('posts')
  .exec(function(err, data){
    res.render('profile',{details:data})
  })
});

/**logout route */
router.get('/logout', function(req, res){
  req.logOut();
  res.redirect("/")
})

/* upadte user details route */
router.get('/update',isLoggedIn,function(req, res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(founduser){
    res.render('updateinfo',{details:founduser})
  })
})



router.post('/updateinfo',function(req, res){
  userModel.findOneAndUpdate({username:req.session.passport.user},{
      name:req.body.name,
      username:req.body.username,
      email:req.body.email
    },{new:true})
    .then(function(updatedUser){
      req.flash('status', 'Details Updated !')
      res.redirect('/profile')
    })
});

/** post upload */
router.post('/postreg', function( req, res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    postModel.create({
      author: foundUser._id,
      post: req.body.post
    })
    .then(function(createdPost){
      foundUser.posts.push(createdPost)
      foundUser.save()
      .then(function(){
        res.redirect('/profile')
      })
    })
  })
})

/**------upload image------ */
router.post('/upload',upload.single('image'),function(req, res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    foundUser.profileImg = `./images/Uploads/${req.file.filename}`;
    foundUser.save()
    .then(function(){
      req.flash('status', 'Image Succesfully Uploaded !')
      res.redirect('/profile')
    })
    })
  });
 
/**--------------------- */
/** ---------allblogs rout---------- */

router.get('/allblogs',function(req, res){
  postModel.findRandom({},{},{limit:10, populate:'author'}, function(err, data){
    if(!err){
      res.render('allblogs',{details: data});
    }
  })
    

})


function isLoggedIn(req, res, next)
{
  if(req.isAuthenticated()){
    return next();
  }
  else{
    req.flash('error', 'You need to login first');
    res.redirect('/login')
  }
}

/* redirectto profile if login */
function redirectToProfile(req, res, next){
  if(req.isAuthenticated()){
    res.redirect('/profile');
  }
  else{
    return next();
  }
}




module.exports = router;
