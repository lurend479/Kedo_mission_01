var request = require("request");  
var cheerio = require("cheerio");

var newsFindkey = [
  {
    url : 'http://www.hani.co.kr/',
    findkey : '.article-title',
    plusurl : 'http://www.hani.co.kr/',
    title : '한겨레',
    load : false,
    newsTitle : [],
    newsTitleHerf : []
  },
  {
    url : 'http://newstapa.org/',
    findkey : '.item-head',
    plusurl : '',
    title : '뉴스타파',
    load : false,
    newsTitle : [],
    newsTitleHerf : []
  }
];
var g_res = null;
// exports란 객체를 이용하여 함수를 작성
// jade는 단순히 뷰를 위한 목적으로 사용 해야함
// 그렇기에 라우터 쪽에서 데이터를 가공 한뒤 
// jade에서는 가공된 데이터를 가지고 뷰를 하게끔 수정 해야함
exports.main = function(req,res){
    titleText = [];
    titleHerf = [];
    g_res = res;
    for(var index = 0 ; index < newsFindkey.length ; ++index)
    {
        newsFindkey[index].load = false;
    }
    loadNewsTitle();
}

function loadNewsTitle(){
    var loadNews = function(findNewsIndex){
            request(newsFindkey[findNewsIndex].url, function(error, response, body){
                GetTitleHref(cheerio.load(body), newsFindkey[findNewsIndex]);
                loadEnd(findNewsIndex);
            })
    };

    for(var index = 0 ; index < newsFindkey.length ; ++index)
    {
        loadNews(index);
    }
}

function loadEnd(index){
    newsFindkey[index].load = true;
    

    var allLoad = true;
    for(var index = 0 ; index < newsFindkey.length ; ++index)
    {
        if(newsFindkey[index].load == false)
        {
            allLoad = false;
            break;
        }
    }

    if(allLoad)
    {
        g_res.render('main', {newsData: newsFindkey});
    }
}

function GetTitleHref(loadData, findData)
{
    var titleList = [];
    var titleHrefList = [];
    var postElements = loadData(findData.findkey);
      postElements.each(function() {
        var postTitle = loadData(this).find("a").text();
        var postHref = loadData(this).find("a").attr("href");

        titleList.push(postTitle);    
        titleHrefList.push(findData.plusurl + postHref);
    });
    findData.newsTitle = titleList;
    findData.newsTitleHerf = titleHrefList;
}