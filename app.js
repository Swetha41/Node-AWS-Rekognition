var express = require('express')
var app = express()
var PORT = process.env.PORT || 3000

//public
app.use('/assets', express.static(__dirname + '/public'))
app.use( express.static(__dirname + '/images'))

//view engine
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

//controller code
var rekogController = require('./controllers/rekogController')
rekogController(app)

//port
app.listen(PORT,  (req,res) => {
    console.log(`app started at port ${PORT}`)
})