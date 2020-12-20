var mongoose = require('mongoose');
var mongooseRandom = require('mongoose-simple-random');


var postSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    post: String,
    time:{
        type: Date,
        default: Date.now
    }
})

postSchema.plugin(mongooseRandom);

module.exports = mongoose.model('posts', postSchema);
