const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb"); // ObjectId를 처리하기 위한 객체

module.exports = (app) => {
    router.get(["/friends/list", "/friends"], (req, resp) => {
        // express에서 db 객체 꺼내고
        let db = app.get("db");
        // 쿼리 수행
        db.collection('friends').find().toArray()
        .then(result => {
            console.log(result);
            // 결과를 템플릿에 반영
            resp.render("friends_list", { friends: result });
        })
        .catch(reason => {
            console.error(reason);
        })
        // resp.status(200)
        //     .contentType("text/html;charset=utf-8")
        //     .send("<p>Web Router 응답</p>");
    });

    // 새 친구 등록 폼
    router.get("/friends/new", (req, resp) => {
        resp.render("friend_insert_form");
    })

    // 새 친구 등록 액션
    router.post("/friends/save", (req, resp) => {
        // 폼 정보는 req.body
        console.log(req.body);
        let document = req.body;
        document.age = parseInt(document.age);

        let db = app.get("db");

        db.collection("friends").insertOne(document)
        .then(result => {
            console.log(result);
            resp.status(200)
                .send("SUCCESS: 친구를 추가했습니다.");
        })
        .catch(reason => {
            console.error(reason);
            resp.status(500) // Internal Server Error
                .send("ERROR: 친구를 추가하지 못했습니다.");
        })
    })

    // 사용자 정보 확인
    router.get("/friends/show/:id", (req, resp) => {
        console.log("id:", req.params.id);

        let db = app.get("db");
        db.collection('friends')
        .findOne({ _id: ObjectId(req.params.id) })
        .then(result => {
            resp.render("friend_show", { friend: result });
        })
        .catch(reason => {
            resp.status(500)
                .send("<p>사용자 정보가 없습니다.</p>");
        })
    });

    // 사용자 정보 수정
    // 수정 폼으로 이동
    // id 정보를 가지고 수정
    // /friends/modify (get)
    router.get("/friends/modify/:id", (req, resp) => {
        console.log("id:", req.params.id);

        let db = app.get("db");
        db.collection('friends')
        .findOne({ _id: ObjectId(req.params.id) })
        .then(result => {
            resp.render("friend_modify_form", { friend: result });
        })
        .catch(reason => {
            resp.status(500)
                .send("<p>수정할 수 없습니다.</p>");
        })
    });
    
    // 사용자 정보 수정 전송 폼
    // 수정(업데이트)
    router.post("/friends/update/:id", (req, resp) => {
        // 폼 정보는 req.body로 넘어온다.
        let db = app.get("db");
        let document = req.body;

        db.collection('friends')
        .UpdateOne(
            { _id: ObjectId(req.params.id) }, // 조건 객체
            {   $set: 
                    { name: req.body.name,
                    species: req.body.species,
                    age: req.body.age }
            }
        )
        .then(result => {
            console.log(result);

            resp.status(200)
                .redirect("/web/friends");
        })
        .catch(reason => {
            resp.status(500)
                .send("<p>업데이트할 수 없습니다.</p>");
        })
    });

    // 삭제
    router.get("/friends/delete/:id", (req, resp) => {
        console.log("삭제할 ID:", req.params.id);
        let db = app.get("db");
        db.collection("friends")
        .deleteOne({_id: ObjectId(req.params.id)})
        .then(result => {
            // 리스트 페이지로
            resp.redirect("/web/friends/list");
        })
        .catch(reason => {
            resp.status(500)
                .send("<p>삭제할 수 없습니다.</p>");
        })
    })
    return router;
}