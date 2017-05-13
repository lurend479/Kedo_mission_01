var express = require('express');
var request = require("request");  
var cheerio = require("cheerio");
var async = require("async");

var newsFindkey = [
  {
    url : 'http://www.hani.co.kr/',
    findkey : '.article-title',
    plusurl : 'http://www.hani.co.kr/',
    title : '한겨레'
  },
  {
    url : 'http://newstapa.org/',
    findkey : '.item-head',
    plusurl : '',
    title : '뉴스타파'
  }
];

var app = express();
app.use(express.static('public'));
app.locals.pretty = true;  

var titleText = [];
var titleHerf = [];
var loadComplete = 0;

app.get('/', function(req, res){

  loadComplete = 0;
  var tasks = [];
  var functionTEST = function(callback){
        titleText.push(newsFindkey[loadComplete].title);
        titleHerf.push(newsFindkey[loadComplete].url);
        titleText.push('');
        titleHerf.push('');
        request(newsFindkey[loadComplete].url, function(error, response, body){
          var returnValue = GetTitleHref(cheerio.load(body), newsFindkey[loadComplete].findkey, newsFindkey[loadComplete].plusurl);
          
          loadComplete++;
          callback(null);
        })
  };
        
  for(var index = 0 ; index < newsFindkey.length ; ++index)
  {
    tasks.push(functionTEST);
  }

  async.waterfall(tasks, function (err) {
      if (err)
          console.log('err');
      else
          console.log('done');

      var lis = '';
      for(var i=0; i< titleText.length; i++){
        lis = lis + '<li>'+ '<a href=' + titleHerf[i] + '>' + titleText[i] + '</li>';
      }

      var output = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title></title>
          </head>
          <body>
              Hello, Dynamic!
              <ul>
                ${lis}
              </ul>
          </body>
        </html>`;
        res.send(output);
  });
});

function GetTitleHref(loadData, findKey, plusURL)
{
    var postElements = loadData(findKey);
      postElements.each(function() {
        var postTitle = loadData(this).find("a").text();
        var postHref = loadData(this).find("a").attr("href");
          
        titleText.push(postTitle);
        titleHerf.push(plusURL + postHref);
    });

    return true;
}

