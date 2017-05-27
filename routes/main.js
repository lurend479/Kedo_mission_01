var newsParsing = require("../public/script/newsParsing.js");

var gRespons = null;
var gParsingData = null;
exports.main = function(req,res){
    gRespons = res;
    gParsingData = null;
    var parsing = function (){
        newsParsing.NewsDataParsing(ViewNewsData);  
    };

    parsing();
}

function ViewNewsData(parsingData){
    gParsingData = parsingData;
    gRespons.render('main', {newsDatas: gParsingData});  
}