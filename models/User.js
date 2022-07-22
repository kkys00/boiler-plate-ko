const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10; //saltRounds 10자리를 만들어서 암호화 시킴
const jwt = require('jsonwebtoken');

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

userSchema.pre('save', function( next ){
    let user = this;
    
    if(user.isModified('password')){//비밀번호를 바꿀 때에만 암호화하도록 조건 걸기
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err) //에러가 나면 그냥 바로 다음으로 next.
    
            //salt를 제대로 생성했다면
            bcrypt.hash(user.password, salt, function(err, hash){//파라미터로 들어가는 hash가 암호화된 비밀번호
                if(err) return next(err); //에러가 나면 돌려 보냄
                user.password = hash; //유저의 비밀번호를 해시된 비밀번호로 바꾼다.
                next();
            })
        })
    } else {
        next() //비밀번호가 아니라 다른 것을 바꾸는 거면 바로 보냄.
    }
})

userSchema.methods.comparePassword = function(plainPassword, callbackFunction){
    //plainPassword를 암호화한 뒤 db 상에 있는 암호화된 비밀번호와 맞는지 확인해야 한다.
    //왜냐면 이미 암호화된 비밀번호를 복호화할 수는 없다.
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return callbackFunction(err); //비밀번호가 맞지 않으면 에러를 보냄
        callbackFunction(null, isMatch); //맞으면 isMatch를 보냄
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this; //몽고db 상 id가 _id 변수에 들어 있다.
    var token = jwt.sign(user._id.toHexString(), 'secretToken') //토큰을 만들 때 사인에서 받을 때 플레인 오브젝트를 받아야 해서.
    //userSchema token field에 넣는다.
    user.token = token;
    user.save(function(err, user){
        if(err) return cb(err) //error가 있으면 콜백으로 에러를 전달하고 아니면
        cb(null, user) //토큰까지 포함된 유저 정보 보내기
    })
}

userSchema.statics.findByToken = function(token, cb){
    var user = this;
    //토큰 디코드
    jwt.verify(token, 'secretToken', function(err, decoded){ //decoded는 디코드된 유저 아이디
        //유저 아이디를 이용해 유저를 찾은 다음에 
        user.findOne({ "_id" : decoded, "token" : token }, function(err, user){ //findOne은 몽고db 빌트인 함수
            if(err) return cb(err);
            cb(null, user)
        })
        //클라이언트에서 가져온 토큰과 db에 보관된 토큰이 일치하는지 확인한다.


    })
}

const User = mongoose.model('User', userSchema); //스키마를 모델로 감싸주는 작업. 파라미터 1. 모델의 이름 User, 2. 스키마

module.exports = { User }//이 모델을 다른 파일에서도 쓸 수 있게 익스포트
