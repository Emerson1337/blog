const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const admin = require('./routes/admin')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Postagem")
const Postagem = mongoose.model("Postagens")
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require('./routes/usuario')
const passport = require('passport')
require("./config/auth")(passport)

//CONFIGURACOES
    //Sessao
        app.use(session({
            secret: "key",
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())

    //Middleware
        app.use((req, res, next) => {
            //criando variavel local
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            next()

        })
        
    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    //handlebars
        const hbs = exphbs.create({
            defaultLayout: 'main', 
            extname: 'handlebars',
            handlebars: allowInsecurePrototypeAccess(Handlebars)
        });
    
        app.engine('handlebars', hbs.engine); 
        app.set('view engine', 'handlebars');
        app.set('views', 'views');

    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp", {useNewUrlParser: true, useUnifiedTopology: true})
        .then(()=>{
            console.log("Connected")
        }).catch((error) => {
            console.log("Connection error! " + error)
        })
    //Public
        app.use(express.static(path.join(__dirname,"public")))

    //Rotas
    app.use('/admin', admin)
    app.use('/cadastro', usuarios)

    app.get('/', (req, res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render('index', {postagens: postagens})
        })

    })

    app.get('/posts', (req, res) => {
        res.send("lista de posts")
    })


    app.get("/postagens/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).populate("categoria").sort({data: "desc"}).then((postagem) => {
            if(postagem){
                res.render("postagens/index", {postagem: postagem})
            } else {
                req.flash("error_msg", "Nenhuma postagem encontrada!")
                res.redirect("/")
            }
        })
    })


    app.get("/categorias", (req, res) =>{
        Categoria.find().lean().then((categorias)=>{
            res.render("categorias/index", {categorias: categorias})
        }).catch((error)=>{
            req.flash("error_msg", "Nenhuma categoria cadastrada!")
            res.redirect("/")
        })
        
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagem) => {
                    res.render("categorias/postagens", {postagem: postagem})
                })
            } else {
                req.flash("error_msg", "Categoria não encontrada!")
                res.redirect("/")
            }
        }).catch((error) => {
            req.flash("error_msg", "Erro ao buscar categoria!")
        })
    })

//ABRINDO SERVIDOR
const PORT = 8081;
app.listen(PORT, ()=>{
    console.log("Server has been initialized!")
})