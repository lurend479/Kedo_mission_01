var cheerio = require("cheerio");
var request = require("request");  
var iconv = require('iconv-lite');

var isEmpty = function(value){ if( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){ return true }else{ return false } };

var NewsTitleData = function(title, herf){
    this.NewsTitle = title;
    this.NewsTitleHerf = herf;
}

var NewsData = function(name, baseHerf, findKey, iconSrc)
{
    this.NewsName = name;
    this.NewsBaseHerf = baseHerf;
    this.NewsTitles = new Array();
    this.NewsIconSrc = iconSrc;
    this.ParsingComplete = false;
    this.FindKey = findKey;
}
NewsData.prototype.GetNewsTitleData = function(index)
{
    return this.NewsTitles[index];
}

NewsData.prototype.NewsDataClear = function(){
    this.NewsTitles = new Array();
    this.ParsingComplete = false;
}

NewsData.prototype.NewsDataParsing = function(loadData){

    var newsTitles = [];
    var newsTitleHrefs = [];

    // 언론사 별로 파싱하는 함수를 나눠야함
    var parsingFunction = null;
    // 한겨레
    // 뉴스타파
    switch(this.NewsName)
    {
        case "한겨례":
        case "뉴스타파":
        case "동아일보":
        case "YTN":
        case "헤럴드경제":
        case "지디넷":
            parsingFunction = function(index, data) {
            var postTitle = loadData(data).find("a").text();
            var postHref = loadData(data).find("a").attr("href");

            if(isEmpty(postTitle) == true || isEmpty(postHref) == true)
                return;

            newsTitles.push(postTitle);
            newsTitleHrefs.push(postHref);
            }
        break;

        case "조선일보":
            parsingFunction = function(index, data) {
            var postTitle = loadData(data).find("a").text();
            var postHref = loadData(data).find("a").attr("href");

            if(isEmpty(postTitle) == true || isEmpty(postHref) == true)
                return;

            // 조선일보는 euc-kr로 되어 있음
            // iconv-lite가 정상작동을 하지 않음
            var strContents = new Buffer(postTitle);
            var test = iconv.decode(strContents, 'EUC-KR').toString();
            newsTitles.push(test);
            newsTitleHrefs.push(postHref);
            }
        break;
        case "미디어오늘":
            parsingFunction = function(index, data) {
            var postTitle = loadData(data).text();
            var postHref = loadData(data).attr("href");

            if(isEmpty(postTitle) == true || isEmpty(postHref) == true)
                return;

            newsTitles.push(postTitle);
            newsTitleHrefs.push(postHref);
        }
        break;
        case "오마이뉴스":
            parsingFunction = function(index, data) {
            var postTitle = loadData(".cont").find("dt").find("a").text();
            var postHref = loadData(".cont").find("dt").find("a").attr("href");

            if(isEmpty(postTitle) == true || isEmpty(postHref) == true)
                return;

            newsTitles.push(postTitle);
            newsTitleHrefs.push(postHref);
            }
        break;
    }

    var postElements = loadData(this.FindKey);
    postElements.each(parsingFunction);

    var addBaseHerf = false;
    switch(this.NewsName)
    {
        case "한겨례":
        case "미디어오늘":
        case "지디넷":
        case "오마이뉴스":
        addBaseHerf = true;
        break;
        case "뉴스타파":
        case "조선일보":
        case "동아일보":
        case "YTN":
        case "헤럴드경제":
        break;
    }

    for(var index = 0 ; index < newsTitles.length ; ++index)
    {
        SetNewsTitleData(this,newsTitles[index].toString(), newsTitleHrefs[index].toString(), addBaseHerf);
    }
    this.ParsingComplete = true;
}

var NewsDatas = new Array(
    new NewsData("한겨례","http://www.hani.co.kr/", ".article-title","http://img.hani.co.kr/section-image/15/hani/images/common/logo_hani.png")
    // new NewsData("뉴스타파","http://newstapa.org/",".item-head","http://img.hani.co.kr/section-image/15/hani/images/common/logo_hani.png"),
    // new NewsData("조선일보","http://www.chosun.com/",".art_list_item","http://image.chosun.com/main/201505/csh_main_logoc.png"),
    // new NewsData("동아일보","http://www.donga.com/",".txt_li","http://image.donga.com/pc/2017/images/common/img_logo.png"),
    // new NewsData("미디어오늘","http://www.mediatoday.co.kr/news/articleList.html",".list_title_a","http://im.mediatoday.co.kr/logo/logo.png"),
    // new NewsData("YTN","http://www.ytn.co.kr/",".type2","http://www.ytn.co.kr/img/_top/ytnlogo_2017.jpg"),
    // new NewsData("헤럴드경제","http://biz.heraldcorp.com/",".ellipsis","http://res.heraldm.com/nbiz_2016/images/logo.png")
    //new NewsData("지디넷","http://www.zdnet.co.kr/news/news_list.asp?zdknum=0000&lo=z3",".article_li_1"),
    //new NewsData("오마이뉴스","http://www.ohmynews.com/NWS_Web/ArticlePage/Total_Article.aspx",".list_type1")
    
)

function NewsDataClear(){
    for(var index in NewsDatas)
    {
        NewsDatas[index].NewsDataClear();
    }
}

function NewsDataParsing(){
    var parsingFunc = function (data){
            request(data.NewsBaseHerf, function(error, response, body){
                data.NewsDataParsing(cheerio.load(body));
                NewsDataParsingComplateCheck();
            })
        };

    for(var index in NewsDatas)
    {
        parsingFunc(NewsDatas[index]);
    }
}

function SetNewsTitleData(newsData, title, herf, addBaseHerf)
{
    if(title === "" || herf === "")
        return;

    if (herf.indexOf(newsData.NewsBaseHerf) < 0 && addBaseHerf == true)
        herf = newsData.NewsBaseHerf + herf;

    var data = new NewsTitleData(title, herf);
    newsData.NewsTitles.push(data);
}

function NewsDataParsingComplateCheck(){
    for(var index in NewsDatas)
    {
        if(NewsDatas[index].ParsingComplete == false)
            return;
    }

    ParsingEndFunc(NewsDatas);
}

var ParsingEndFunc = null;
module.exports.NewsDataParsing = function(endFunc){
    ParsingEndFunc = endFunc;
    // 데이터 제거
    NewsDataClear();
    // 실제로 파싱
    NewsDataParsing();
}



