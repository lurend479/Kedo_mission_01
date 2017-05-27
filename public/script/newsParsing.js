var cheerio = require("cheerio");
var request = require("request");  
var NewsTitleData = function(title, herf){
    this.NewsTitle = title;
    this.NewsTitleHerf = herf;
}

NewsTitleData.prototype.GetNewsTitle = function(){
    return this.NewsTitle;
}
NewsTitleData.prototype.GetNewsTitleHerf = function(){
    return this.NewsTitleHerf;
}

var NewsData = function(name, baseHerf, findKey)
{
    this.NewsName = name;
    this.NewsBaseHerf = baseHerf;
    this.NewsTitles = new Array();
    this.NewsIconSrc;
    this.ParsingComplete = false;
    this.FindKey = findKey;
}
NewsData.prototype.SetNewsTitleData = function(title, herf)
{
    if(title === "" || herf === "")
        return;

    var data = new NewsTitleData(title, herf);
    this.NewsTitles.push(data);
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

    var newsTitleDatas = [];

    // 언론사 별로 파싱하는 함수를 나눠야함
    var postElements = loadData(this.FindKey);
    postElements.each(function() {
        var postTitle = loadData(this).find("a").text();
        var postHref = loadData(this).find("a").attr("href");

        newsTitleDatas.push(new NewsTitleData(postTitle, postHref));
    });

    this.NewsTitles = newsTitleDatas;
    this.ParsingComplete = true;
}

var NewsDatas = new Array(
    new NewsData("한겨례","http://www.hani.co.kr/", ".article-title"),
    new NewsData("뉴스타파","http://newstapa.org/",".item-head")
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



