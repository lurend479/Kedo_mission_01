var express = require('express');
var http = require('http');


// routes라는 폴더에 있는 js 파일을 가져 온다??
// 170430 공부 필요
var routes = require('./routes/main.js');

// express 생성
var app = express();

// 옵션 설정
// 참고 http://sukth09.tistory.com/32
// process란 객체내에 있는 env의 객체에 설정되어 있는 포트번호를 가져옴
//  임시로 설정한 포트 임
// 또한 3000번 포트로 설정
app.set('port', process.env.PORT || 3000);

// 뷰 디렉토리 설정
app.set('views',"./views");

// 뷰 엔진 설정 jade(pug), ejs가 있다.
app.set('view engine', 'jade');

// 정작파일 디렉토리 설정
// css나 이미지 파일등을 저장하는곳 설정
app.use(express.static('public'));

// 라우터의 개념으로 루트로 들어 왔을때 응답하는 객체
// exports객체를 이용 다른 객체에 있는 함수를 가져 올 수 있음
// exports로 함수를 만들고 require로 추출(?)해서 사용 가능함
app.get('/', routes.main);

// 웹사이트에서 볼때 소스를 이쁘게 나오게
app.locals.pretty = true;  


http.createServer(app).listen(app.get('port'), function(){
    console.log("start server port : " + app.get('port'));
})