var express = require('express');
var jade = require('jade');
var mongoose = require('mongoose');
var _ = require('underscore');
var Movie = require('./models/movie');

// 静态资源请求路径
var path = require('path');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 3000;

//更新时间
app.locals.moment = require('moment');

// 传入本地的数据库
mongoose.connect('mongodb://localhost/imooc')

app.set('views', './views/pages');
app.set('view engine', 'jade');


// 静态资源请求路径
app.use(express.static(path.join(__dirname, 'bower_components')));


// 表单数据格式化
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(port);

console.log("Service is start , Port in :" + port);

// index page 
app.get('/', function (req, res) {

	//直接调用模型，在回调方法中内拿到返回的数组movies
	Movie.fetch(function (err, movies) {
		if (err) {
			console.log(err);
		}

		//渲染首页，同时把查询到的电影列表（key）赋值给movies
		res.render('index', {
			title: 'demo1 首页1',
			movies: movies
		});
	});
});

//detail page 
app.get('/detail/:id', function (req, res) {

	//拿到detail后的 :id
	var id = req.params.id;

	// 拿到查询后的id数据，将详情页返回回去
	Movie.findById(id, function (err, movie) {
		res.render('detail', {
			title: movie.title,
			id: id,
			movie: movie
		});
	})
});

//admin page
app.get('/admin/movie', function (req, res) {
	res.render('admin', {
		title: 'demo1 后台录入页',
		movie: {
			_id: '',
			doctor: '',
			country: '',
			title: '',
			year: '',
			poster: '',
			language: '',
			flash: '',
			summary: ''
		}
	});
});


//admin update movie
// 匹配到 update/:id，如果是从这个URL地址过来的，那么是需要更新这个地址
app.get('/admin/update/:id', function (req, res) {

	//拿到id，如果id存在，就渲染
	var id = req.params.id;
	if (id) {
		Movie.findById(id, function (err, movie) {

			//渲染
			res.render('admin', {
				title: 'imooc 后台更新页面',
				movie: movie
			});
		});
	}
});

//admin delete movie
app.delete('/admin/list', function (req, res) {
	var id = req.query.id;
	if (id) {
		Movie.remove({ _id: id }, function (err, movie) {
			if (err) {
				console.log(err);
			} else {
				res.json({ success: 1 });
			}
		});
	}

})

//admin post movie 拿到从后台路由页post过来的数据
app.post('/admin/movie/new', function (req, res) {

	var id = req.body.movie._id;
	var movieObj = req.body.movie;
	var _movie;

	

	//如果id不是undefined，说明这部电影已经在数据库存储过的，这时候就需要进行更新
	if (id !== undefined) {
		Movie.findById(id, function (err, movie) {
			if (err) {
				console.log(err);
			}
			

			// 用post传过来的 数据里面更新过的字段 来替换掉 老的这条电影数据
			// extend方法 用另外一个对象里面新的字段替换掉老的里面对应的字段（查询的目标，新的字段放在第二个位置）
			_movie = _.extend(movie, movieObj);
	
			//save后的movie
			_movie.save(function (err, movie) {
				if (err) {
					console.log(err);
				}

				// 数据更新了，并且存储成功了，就让页面重定向到这部电影的详情页面
				res.redirect('/detail/' + movie._id);
			});
		});
		
	} else {	

		
		//如果这部电影的id是没有定义过的，也就是post表单内是没有movie._id这个值的，说明这个电影是新增加的
		_movie = new Movie({
			doctor: movieObj.doctor,
			title: movieObj.title,
			language: movieObj.language,
			country: movieObj.country,
			year: movieObj.year,
			poster: movieObj.poster,
			flash: movieObj.flash,
			summary: movieObj.summary
		});

		//同上，保存电影，同时重定向
		_movie.save(function (err, movie) {
			if (err) {
				console.log(err);
			}
			res.redirect('/detail/' + movie._id);
		});
	}
});



//list page
app.get('/admin/list', function (req, res) {

	// 和首页查询是一样的
	Movie.fetch(function (err, movies) {
		if (err) {
			console.log(err);
		}
		res.render('list', {
			title: 'imooc 列表页',
			movies: movies
		});
	});
});
