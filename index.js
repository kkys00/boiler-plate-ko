const express = require('express') //express를 다운받았기 때문에 가져올 수 있는 모듈
const app = express() //새로운 express 앱을 만들었음
const port = 5000 //port는 3000, 4000, 5000 해도 된다.
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const config = require("./config/key");

const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

//bodyParser에 옵션 주기
app.use(bodyParser.urlencoded({extended: true})); //클라이언트에서 오는 정보를 서버에서 분석해서 가져올 수 있게 해주는 것. application/x-www-form urlencoded로 된 데이터를 분석해서 가져올 수 있게 해줌
app.use(bodyParser.json()); //application/json 타입으로 되어 있는 것을 분석해서 가져올 수 있게 해줌
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(()=> console.log('MongoDB connected...')).catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World! 호호랭랭이')) //root directory에 hello world가 출력되게 함

app.post('/api/users/register', (req, res) => {
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

app.post('/api/users/login', (req, res) => {
    //요청된 이메일을 데이터베이스에 있는지 찾음
    User.findOne({ email: req.body.email }, (err, user) => {//findOne은 몽고DB에서 제공하는 메소드
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        //O - 비밀번호가 맞는지 확인
        user.comparePassword(req.body.password, (err, isMatch) => { //첫 번째 인자: plain password, 두 번째 인자 callback function
            if(!isMatch) return res.json( {loginSuccess:false, message: "비밀 번호가 틀렸습니다."} ) //비밀번호가 틀렸다.
            //O - 비밀번호가 같으면 유저에게 줄 토큰 생성
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err); //400은 에러가 있다는 것. error 메시지를 보낸다. send(err)
                //토큰을 여러 곳에 저장할 수 있는데.. 쿠키, 로컬스토리지, 세션 등에 저장할 수 있다.
                //여기서는 쿠키에 저장한다. 쿠키에 저장하려면 라이브러리를 또 깔아야 한다. cookie parser
                res.cookie("x_auth", user.token).status(200).json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})

app.get('/api/users/auth', auth, (req, res) => { //auth는 미드웨어로 리퀘스트 받은 다음에 중간에서 해주는 것
    //이 코드 줄에 도착하면 Authentication이 true이다.
    res.status(200).json({ //json으로 유저의 정보를 전달해줌. 그럼 유저의 정보 이용 가능
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true, //0이 일반유저, 1이면 관리자
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req, res)=> {
    User.findOneAndUodate({ _id: req.user._id}, { token: "" },
    (err, user) => {
        if(err) return res.json({ success: false, err });
        return res.status(200).send({ success: true });
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`)) //이 앱을 5000번 포트에서 실행시킨다.
