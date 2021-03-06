// Express 모듈 불러오기
const { response } = require("express");
const express = require("express");
const http = require("http"); // 노드 기본 http 모듈

// Express 객체 생성
const app = express();

// 설정, 속성을 집어 넣을 때
// set(키, 값)
// get(키)

//  etag를 사용하지 않음  
app.set("etag", false);

// Express 기본 포트 속성을 설정
// 환경 변수에 PORT가 설정되어 있으면 그 값을 사용
app.set('port', process.env.PORT || 3000);

// 로거 추가
// npm install morgan
const logger = require("morgan"); // 로거 불러오기
// 로거를 express에 추가: 미들웨어 추가
app.use(logger("dev"));

// MongoDB
const { MongoClient } = require("mongodb");

// 정적 웹의 제공
// Express.static 미들웨어 함수를 등록
// public 디렉터리 내부의 Static 파일을 정적 파일로 제공
app.use(express.static(__dirname + "/public"));

// body-parser 등록
// 4.16 버전 이후에는 express 내부에 bodyParser가 포함 
// POST 요청을 처리할 수 있게 된다.
app.use(express.urlencoded({ extended: false }));

// View 엔진 설정
app.set("view engine", "ejs");  // 뷰엔진으로 ejs 사용 선언
app.set("views", __dirname + "/views"); // 템플릿의 위치

// GET 메서드 요청의 처리
// app.get(url, callback)
app.get("/", (req, resp) => {
    // http 모듈의 응답 처리 메서드
    /*
    console.log("[GET] /");
    resp.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
    resp.write("Express Welcome You!");
    resp.end();
    */
   resp.status(200)
        .contentType("text/html;charset=UTF-8")
        .render("home");
});

// 위에꺼나 아래꺼 둘중 택1
app.get("/welcome", (req, resp) => {
    // express의 추가 응답 처리 메서드
    console.log("[GET] / welcome");
    resp.status(200)
    .header("Content-Type", "text/html;charset=UTF-8")
    .send("Welcome!")
})

// GET 요청 파라미터의 처리
app.get("/request", (req, resp) => {
    console.log("[GET] / request");
    console.log(req.query); // req.query -> url 파라미터 객체
    console.log("[QUERY] name:" + req.query.name);

    let paramName = req.query.name;
    if (paramName === undefined ||
        paramName.length == 0) {    // name 파라미터가 전달되지 않으면
            resp.status(404)        // NOT FOUND
                .contentType("text/html;charset=UTF-8")
                .send("Name 정보를 확인할 수 없습니다.")
    } else {
        // 파라미터가 정상 전달되면
        resp.status(200) // 성공
            .contentType("text/html;charset=UTF-8")
            .send("Name" + paramName);
    } 
})

// URL 파리미터 처리(Fancy URL, Pretty URL)
// URL의 경로일부로 데이터 전송 방식
/*
app.get("/urlparam/:name", (req, resp) => {
    // url 파라미터는 params 객체로 얻어온다
    let userName = req.params.name;
    resp.status(200)
        .contentType("text/html;charset=UTF-8")
        .send("<h1>name:" + userName + "</h1>")
        .send("<p>URL파라미터를 전달 받았습니다.</p>");
})
*/

app.get("/urlparam/:name", (req, resp) => {
    // url 파라미터는 params 객체로 얻어온다
    let userName = req.params.name;
    resp.writeHead(200, {"Content-Type": "text/html;charset=UTF-8"});
    resp.write("<h1>name:" + userName + "</h1>")
    resp.write("<p>URL파라미터를 전달 받았습니다.</p>")
    resp.send();
});

// View 엔진 활용
app.get("/render", (req, resp) => {
    // 응답 객체의 render 메서드 활용
    resp.contentType("text/html;charset=UTF-8")
        .render("render");
});

// Router 등록 (미들웨어)
const WebRouter = require("./router/webrouter")(app);
app.use("/web", WebRouter);
const apiRouter = require("./router/APIRouter")(app);
app.use("/api", apiRouter);

// 몽고티비 커넥션 -> 커넥트 성공하면 클라이언트 넘어와 app연결
function startServer() {
    // database 연결 정보
    const dburl = "mongodb://localhost:27017";
    // database 연결
    MongoClient.connect(dburl, { useNewUrlParser: true }) // callback
        .then(client => {
        // db 선택
        console.log("데이터베이스에 연결되었습니다.");
        // 선택된 db를
        let db = client.db("mydb")
        // express에 추가
        app.set("db", db); // db 키로 몽고 클라이언트 추가

        // express 실행
        startExpress();
    })
    .catch(reason => {
        console.error(reason);
    });
}

function startExpress() {
    // Express 서버 Start
    http.createServer(app).listen(app.get("port"), () => {
        console.log("Web Server is running on port:" + app.get("port"));
    })
}
startServer();