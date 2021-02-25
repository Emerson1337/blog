const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//model de usuário
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')


module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'email'}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuarios) => {
            if(!usuarios){
                return done(null, false, {message: "Conta inexistente"})
            }

            bcrypt.compare(senha, Usuario.password, (error, equals) => {
                if(equals){
                    return done(null, user)
                } else {
                    return done(null, false, {message: "Senha incorreta"})
                }
            })

        })
    }))

    passport.serializeUser((user, done) =>{
        done(null, user.id)

    })

    passport.deserializeUser((id, done) =>{
        User.findById(id, (err, usuario) => {
            done(err, user)
        })
    })



}