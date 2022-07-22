const { User } = require('..models/User')
let auth = (req, res, next) => {
    //인증 처리 코드

    //클라이언트 쿠키에서 토큰 갖고 오기
    let token = req.cookies.x_auth; //이게 토큰을 쿠키에서 가져오는 코드

    //토큰을 복호화 한 후 유저 찾기 == 유저 모델에서 메소드를 만들면 됨.
    User.findByToken(token, (err, user) => {
        if(err) throw err; //에러가 났으면 에러 보내기
        if(!user) return res.json({ isAuth: false, error: true }) //유저 없음

        req.token = token; //리퀘스트에 토큰과 유저를 넣어줌.
        req.user = user;
        next();
    })

    //유저가 있으면 인증 Okay

    //유저가 없으면 인증 NO.
}

module.exports = { auth };