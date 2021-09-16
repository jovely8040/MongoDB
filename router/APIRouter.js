const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

function APIRouter(app) {
    router.get("/friends.json", (req, resp) => {
        let db = app.get("db");

        db.collection("friends").find().toArray()
        .then(result => {
            // json 결과 출력
            resp.status(200)
                .header({"Content-Type": "text/json;charset=utf8"})
                .json(result);
        })
    })

    // 하나의 객체만 json 으로
    router.get("/friends/:address", (req, resp) => {
    let id = req.params.address.split('.')[0]
    let db = app.get('db');
    db.collection('friends').findOne({ _id: ObjectId(id) })
      .then(result => {
        resp.status(200)
          .header({ "Content-Type": "text/json;charset=utf-8" })
          .json(result);
      })
      .catch(reason => {
        console.error(reason)
      })

  })

    return router;
}

// 라우터 내보내기
module.exports = APIRouter; 