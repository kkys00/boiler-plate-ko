const express = require('express') //express를 다운받았기 때문에 가져올 수 있는 모듈
const app = express() //새로운 express 앱을 만들었음
const port = 5000 //port는 3000, 4000, 5000 해도 된다.
const bodyParser = require("body-parser");

const config = require("./config/key")

const { User } = require("./models/User");

//bodyParser에 옵션 주기
app.use(bodyParser.urlencoded({extended: true})); //클라이언트에서 오는 정보를 서버에서 분석해서 가져올 수 있게 해주는 것. application/x-www-form urlencoded로 된 데이터를 분석해서 가져올 수 있게 해줌
app.use(bodyParser.json()); //application/json 타입으로 되어 있는 것을 분석해서 가져올 수 있게 해줌

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(()=> console.log('MongoDB connected...')).catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World! 호호랭랭이')) //root directory에 hello world가 출력되게 함

app.post('/register', (req, res) => {
    //회원가입할 때 필요한 정보들을 client에서 가져오면
    //그것들을 데이터 베이스에 넣음

    //정보를 데이터베이스에 넣기 위해서는
    const user = new User(req.body); //req.body는 bodyParser를 이용해서 클라이언트 정보를 받는다.
    user.save((err, dot) => {
        if(err) return res.json({success: false, err}) //성공 실패 및 에러 메시지 전달
        return res.status(200).json({ //성공했으면 성공 했다는 숫자 200을 전달하고 success 플래그 true 설정
            success: true
        })
    }) //몽고 db에서 오는 메소드. 정보들이 유저 모델에 저장된다.


})
app.listen(port, () => console.log(`Example app listening on port ${port}!`)) //이 앱을 5000번 포트에서 실행시킨다.
