const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50,
    },
    email:{
        type: String,
        trim: true, //스페이스를 없애주는 역할. a bc@gmail.com -> abs@gmail.com
    },
    password:{
        type: String,
        minlength: 5,
    },
    lastname:{
        type: String,
        maxlength: 50,
    },
    role:{ //관리자 등 
        type: Number, //1이면 관리자, 0이면 일반 유저
        default: 0,
    },
    image: String,
    token:{ //토큰을 이용해서 나중에 유효성을 관리 가능
        type: String,
    },
    tokenExp: { //토큰을 사용할 수 있는 유효기간
        type: Number
    }
})

const User = mongoose.model('User', userSchema); //스키마를 모델로 감싸주는 작업. 파라미터 1. 모델의 이름 User, 2. 스키마

module.exports = { User }//이 모델을 다른 파일에서도 쓸 수 있게 익스포트
