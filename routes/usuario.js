const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { nextTick } = require('process')


router.get("/", (req, res)=>{
    res.render("cadastro/cadastro")
})

router.post("/", (req, res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length > 30){
        erros.push({text: "Nome inválido!"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null || req.body.email.length > 60){
        erros.push({text: "Email inválido!"})
    }

    if(!req.body.password || typeof req.body.password == undefined || req.body.password == null || req.body.password.length > 30 || req.body.password.length < 8){
        erros.push({text: "Senha inválida! A senha precisa ter ao menos 6 dígitos."})
    }

    if(req.body.password != req.body.password2){
        erros.push({text: "As senhas não coincidem!"})
    }

    if(erros.length > 0){
        res.render("cadastro/cadastro", {erros: erros})
    } else {
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("alert", "A conta já está cadastrada!")
                res.redirect("/usuario/cadastro")
            } else {
                const newUser = new Usuario({
                    user: req.body.nome,
                    email: req.body.email,
                    password: req.body.password
                })
                
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(newUser.password, salt, (erro, hash) => {
                            if(erro){
                            req.flash("error_msg", "Houve um erro ao salvar as informações!")
                            res.redirect("/")
                        }
                        newUser.password = hash
                        newUser.save().then(()=>{
                            req.flash("success_msg", "Conta criada com sucesso!")
                            res.redirect("/")
                        }).catch((error) => {
                            req.flash("error_msg", "Houve um erro ao criar a conta!")
                            res.redirect("/")
                            console.log(error)
                        })


                    })
                })
            }
        }).catch((error) => {
            req.flash("error_msg", "Erro ao consultar banco de dados!")
            res.redirect("/")
        })
    }


   

})

router.get("/login", (req, res)=> {
    res.render("cadastro/login")
})

module.exports = router