const express = require('express') //express를 다운받았기 때문에 가져올 수 있는 모듈
const app = express() //새로운 express 앱을 만들었음
const port = 5000 //port는 3000, 4000, 5000 해도 된다.

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://boilerplate:9AU5NNv5H0SW31I9@boilerplate.2llkdhe.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(()=> console.log('MongoDB connected...')).catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!')) //root directory에 hello world가 출력되게 함

app.listen(port, () => console.log(`Example app listening on port ${port}!`)) //이 앱을 5000번 포트에서 실행시킨다.
