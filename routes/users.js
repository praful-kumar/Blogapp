var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');


mongoose.connect('mongodb://localhost/BlogApp');
var userSchema = mongoose.Schema({
  name : String,
  posts:[{ 
    type: mongoose.Schema.Types.ObjectId,
    ref:'posts'
  }
  ],
  profileImg :{
    type: String,
    default: './images/Uploads/default.jpg'
  },
  username: String,
  email: String,
  password: String,
});
 userSchema.plugin(plm);
 module.exports = mongoose.model('user', userSchema);
