var express = require('express');
var app = express();

var port = process.env.PORT || 3000;
app.listen(port);

console.log('movie-demo start on port' + port);

var path = require('path');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/imovie');

console.log('MongoDB connection success!');

app.locals.moment = require('moment');

var serveStatic = require('serve-static');  // 静态文件处理
app.use(serveStatic('public')); // 路径：public

// 处理 post
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

var _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段

app.set('views', './views/pages');     // 设置视图默认的文件路径
app.set('view engine', 'jade');  // 设置视图引擎：jade

var movie = require('./models/movie.js'); // 载入mongoose 编译后的模型 movie


// index page
app.get('/', function (req, res) {

    // 直接调用模型，在回调方法中内拿到返回的数组 movies
    movie.fetch(function (err, movies) {
        if (err) {
            console.log(err);
        }

        // 渲染首页，同时把查询到的电影列表（key）赋值给 movies
        res.render('index', {
            title: 'movie-demo 首页',
            movies: movies
        });
    });
});


// detail page 详情页
app.get('/movie/:id', function (req, res) {

    // 拿到detail后的 :id
    var id = req.params.id;

    // 拿到查询后的 id 数据，将详情页返回
    movie.findById(id, function (err, movie) {
        res.render('detail', {
            title: 'movie-demo' + movie.title,
            movie: movie
        });
    });
});


// admin page 后台录入页
app.get('/admin/movie', function (req, res) {
    res.render('admin', {
        title: 'movie-demo 后台录入页',
        movie: {
            title: '',
            doctor: '',
            country: '',
            year: '',
            poster: '',
            flash: '',
            summary: '',
            language: ''
        }
    });
});


// admin update movie
// 匹配到 update/:id，如果是从这个URL地址过来的，那么是需要更新这个地址
app.get('/admin/update/:id', function (req, res) {

    // 拿到 id，如果 id 存在，就渲染
    var id = req.params.id;

    if (id) {
        movie.findById(id, function (err, movie) {
            res.render('admin', {
                title: 'imovie 后台更新页',
                movie: movie
            });
        });
    }
});

// admin post movie 后台录入提交
app.post('/admin/movie/new', function (req, res) {

    var id = req.body.movie._id;
    var movieObj = req.body.movie;
    var _movie = null;

    // 如果 id 不是 undefined，说明这部电影已经在数据库存储过的，这时候就需要进行更新
    if (id !== 'undefined') {

        movie.findById(id, function (err, movie) {

            if (err) {
                console.log(err);
            }

            // 用 post 传过来的 数据里面更新过的字段 来替换掉 老的这条电影数据
            // extend 方法 用另外一个对象里面新的字段替换掉老的里面对应的字段（查询的目标，新的字段放在第二个位置）
            _movie = _underscore.extend(movie, movieObj);

            _movie.save(function (err, movie) {

                if (err) {
                    console.log(err);
                }

                // 数据更新了，并且存储成功了，就将页面重定向到这部电影的详情页面
                res.redirect('/movie/' + movie._id);
            });
        });
    } else {

        // 如果这部电影的 id 是没有定义过的，也就是 post 表单内是没有 movie._id 这个值，说明这个电影是新增加的
        _movie = new movie({
            doctor: movieObj.doctor,
            title: movieObj.title,
            country: movieObj.country,
            language: movieObj.language,
            year: movieObj.year,
            poster: movieObj.poster,
            summary: movieObj.summary,
            flash: movieObj.flash
        });
        _movie.save(function (err, movie) {
            if (err) {
                console.log(err);
            }
            res.redirect('/movie/' + movie._id);
        });
    }
});

// list page 列表页
app.get('/admin/list', function (req, res) {

    // 和首页查询是一样的
    movie.fetch(function (err, movies) {
        if (err) {
            console.log(err);
        }
        res.render('list', {
            title: 'movie-demo 列表页',
            movies: movies
        });
    });
});

// list delete movie data 列表页删除电影
app.delete('/admin/list', function (req, res) {
    var id = req.query.id;
    if (id) {
        movie.remove({ _id: id }, function (err, movie) {
            if (err) {
                console.log(err);
            } else {
                res.json({ success: 1 });
            }
        });
    }
});
