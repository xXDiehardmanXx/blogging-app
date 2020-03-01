const express = require('express');
const mySqlConnection = require("../db/db");
const router = express.Router();

let blogQuotes = [
    ['“Don’t focus on having a great blog. Focus on producing a blog that’s great for your readers.”', 'Brian Clark'],
    ['“Blogging is a conversation, not a code.”', 'Mike Butcher'],
    ['“Blogging is like work, but without coworkers thwarting you at every turn.”', 'Scott Adams'] ,
    ['“A blog is only as interesting as the interest shown in others.”', 'Lee Odden'],
    ['“Blogging is just writing — writing using a particularly efficient type of publishing technology.”', 'Simon Dumenco'],
    ['“Blogging is a communications mechanism handed to us by the long tail of the Internet.”', 'Tom Foremski'],
    ['“Blogs are whatever we make them. Defining ‘Blog’ is a fool’s errand.”', 'Michael Conniff'],
    ['“The casual conversational tone of a blog is what makes it particularly dangerous”', ' Daniel B. Beaulieu'],
    ['“Not only are bloggers suckers for the remarkable, so are the people who read blogs.”', 'Seth Godin'],
    ['“Blogging is hard because of the grind required to stay interesting and relevant.”', 'Sufia Tippu'],
];

router.get('/', (req, res) => res.status(200).render('home', {blogQuotes: blogQuotes}));

router.get('/dashboard', (req, res) => {
    if (req.session.user) {
            // Select all blogs and print them:
            mySqlConnection.query("SELECT * FROM blogs", function (err, blogs, fields) {
                if (err) console.log(err);
                res.status(200).render('dashboard', {blogs: blogs});
            });
    } else {
        res.status(401).send('login for this');
    }
});

router.get('/blog/:id', function(req, res) {
    const searchSql = "SELECT * FROM blogs WHERE id = ?";
    mySqlConnection.query(searchSql, [req.params.id], (err, blog) => {
        if (err) {
            res.status(500).redirect('/dashboard');
        } else {
            if (req.session.user) {
                let user = req.session.user;
                res.render('showblog', {blog: blog, user: user}); 
            } else {
                res.send('Please login to see blogs!!');
            }
        }
    });
});

router.post('/blogs/:id', function(req, res) {
    if (req.session.user) {
        let user = req.session.user;
        const insertQuery = 'INSERT INTO comments (comment, author, blog_id, date) VALUES ?';
        const {comment} = req.body;
        var today = new Date();
        var date = today.getDate() + '-' + (today.getMonth()+1) + '-' + today.getFullYear();
        const data = [[comment, user.name, req.params.id, date]];
        mySqlConnection.query(insertQuery, [data], (err, result, fields) => {
            if (err) {
                res.send(err);
            } else {
                res.redirect('/dashboard');
            }
        });
    } else {
        res.redirect('/dashboard');
    }
});

router.delete('/blogs/:id', function(req, res){
    if (req.session.user) {
        mySqlConnection.query('DELETE FROM blogs WHERE id = ?', [req.params.id], (err, result) => {
            if (err) {
                res.send(err);
            } else {
                res.redirect('/dashboard');
            }
        });        
    } else {
        res.redirect('/users/login');
    }
});

router.get('/blogs/:id/edit', function(req, res){
    if (req.session.user) {
        const searchSql = "SELECT * FROM blogs WHERE id = ?";
        mySqlConnection.query(searchSql, [req.params.id], (err, blog) => {
            if (err) {
                console.log(err);
                res.redirect('/dashboard');
            } else {
                res.render('editblog', {blog: blog});
            }
        });
    } else {
        res.redirect('/users/login');
    }
});

router.put('/blogs/:id', function(req, res){
    const { title, image, body, category } = req.body;
    const updateQuery = 'UPDATE blogs SET title=?, category=?, blogText=?, imgURL=? WHERE id=?';
    const data = [title, category, body, image, req.params.id];
    if (req.session.user) {
        mySqlConnection.query(updateQuery, data, (err, result, fields) => {
            if (err) {
                res.redirect('/dashboard');
                console.log(err);
            } else {
                res.redirect('/dashboard');
            }
        });
    } else {
        res.render('/users/login');
    }
});

router.get('/logout', function(req, res, next) {
    if (req.session) {
        req.session.destroy(function(err) {
            if(err) {
                res.send(err);
            } else {
                res.redirect('/');
            }
        });
    }
});

module.exports = router;