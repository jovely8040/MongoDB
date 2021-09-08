// Ticker를 불러와 -> 이벤트 등록 -> start 이벤트 수행 -> 숫자 1씩 증가 -> 10이 되면 -> stop 실행 -> 클리어

const Ticker = require("./modules/ticker");
let count = 0; // 카운트 변수

// tick 이벤트를 받으면 처리할 리스너
process.on("tick", () => {
    count ++;
    console.log(count, "초가 흘렀습니다!");

    if (count >= 10) {
        Ticker.emit("stop");
    }
});

// ticker 생성
let ticker = new Ticker(process);
ticker.start();
