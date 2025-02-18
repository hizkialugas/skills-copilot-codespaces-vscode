// Create web server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const mongoose = require('mongoose');
// const Comment = require('./models/Comment');
// const Post = require('./models/Post');
const { Comment, Post } = require('./models');
// const { Comment, Post } = require('./models/index');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to database
mongoose.connect('mongodb://localhost:27017/comments', { useNewUrlParser: true });
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {
    console.log('Connected to database');
});

// Routes
app.get('/posts', async (req, res) => {
    const posts = await Post.find().populate('comments');
    res.json(posts);
});

app.post('/post', async (req, res) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content
    });
    await post.save();
    res.json(post);
});

app.get('/comments', async (req, res) => {
    const comments = await Comment.find();
    res.json(comments);
});

app.post('/comment', async (req, res) => {
    const post = await Post.findById(req.body.postId);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
        content: req.body.content,
        post: post._id
    });
    await comment.save();
    post.comments.push(comment._id);
    await post.save();
    res.json(comment);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});