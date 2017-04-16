var mongoose = require("mongoose");

//引入 "../schemas/movie.js" 导出的模式模块
var movieSchema = require("../schemas/movie.js");

// 编译生成 movie 模型
var movie = mongoose.model("movie", movieSchema);

module.exports = movie;