var request = require("request");  
var cheerio = require("cheerio");

var newsFindkey = [
  {
    url : 'http://www.hani.co.kr/',
    findkey : '.article-title',
    plusurl : 'http://www.hani.co.kr/',
    title : '한겨레',
    load : false,
    newsTitle : []
  },
  {
    url : 'http://newstapa.org/',
    findkey : '.item',
    plusurl : '',
    title : '뉴스타파',
    load : false,
    newsTitle : []
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
    loadNewsTitle();
}

function loadNewsTitle(){
    var loadNews = function(findNewsIndex){
            request(newsFindkey[findNewsIndex].url, function(error, response, body){
                var titleList = GetTitleHref(cheerio.load(body), newsFindkey[findNewsIndex].findkey, newsFindkey[findNewsIndex].plusurl);
                loadEnd(findNewsIndex, titleList);
            })
    };

    for(var index = 0 ; index < newsFindkey.length ; ++index)
    {
        loadNews(index);
    }
}

function loadEnd(index, titleList){
    newsFindkey[index].load = true;
    newsFindkey[index].newsTitle = titleList;

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
        g_res.render('main', {test3: newsFindkey});
    }
}

function GetTitleHref(loadData, findKey, plusURL)
{
    var titleList = [];
    var postElements = loadData(findKey);
      postElements.each(function() {
        var postTitle = loadData(this).find("a").text();
        var postHref = loadData(this).find("a").attr("href");

        titleList.push(postTitle);    
        // titleText.push(postTitle);
        // titleHerf.push(plusURL + postHref);
    });

    return titleList;
}