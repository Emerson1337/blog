const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require("../models/Postagem")
const Postagem = mongoose.model("Postagens")

router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/posts', (req, res) => {
    res.send('pagina de posts')
})

router.get('/categorias', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/categorias', {categorias: categorias})
    }).catch((error) =>{
        req.flash("error_msg", "Erro ao carregar categoria!")
        res.redirect("/admin")
    })
})

router.post('/categorias/nova', (req, res) => {

    erros = []
    
    if(!req.body.slug || !req.body.nome){
        erros.push({texto: "nome ou Slug inválido!"})
    }

    if(req.body.nome.length < 2 || req.body.slug.length < 2){
        erros.push({texto: "Nome ou Slug curto demais!"})
    }

    if(erros.length > 0){
        res.render("admin/addcat", {erros: erros})
    } else {
        const NovaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(NovaCategoria).save().then(() => {
            console.log("Saved!")
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect('/admin/categorias');
            
        }).catch((error) => {
            req.flash("error_msg", "erro ao salvar categoria. Tente novamente!")
            console.log("Error! " + error)
            res.redirect('/admin')
        })
    }

})

router.get('/addcat', (req, res)=>{
    res.render('admin/addcat')
})

router.get("/categorias/editar/:id", (req,res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategoria", {categoria: categoria})
    }).catch((error)=>{
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categoria")
    })
})


router.post("/categorias/editar", (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria)=> {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((error) => {
            req.flash("error_msg", "Erro ao editar categoria!")
            res.redirect("/admin/categorias")
        })
    })
})

router.post("/categorias/remover", (req, res) => {
    Categoria.deleteOne({id: req.body._id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        
        res.redirect("/admin/categorias")
    }).catch((error) => {
        req.flash("error_msg", "Erro ao deletar categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) => {
        res.render('admin/postagens', {postagens: postagens})
    }).catch((error) =>{
        req.flash("error_msg", "Erro ao carregar postagens!")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/add", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((error) => {
        req.flash("error_msg", "Erro ao adicionar postagem!")
        res.redirect("/admin")
    })
    
})

router.get("/postagens/edit/:id", (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((error)=>{
            req.flash("error_msg", "Falha listar postagens!")
            res.redirect("/admin/postagens")
        })
    }).catch((error)=>{
        req.flash("error_msg", "Falha listar postagens!")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/edit", (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.nome = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        postagem.date = Date.now()

        postagem.save().then(() =>{
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((error) => {
            req.flash("error_msg", "Erro ao editar postagem!")
            res.redirect("/admin/postagens")
        })
    })
})

router.post("/postagens/nova", (req, res) => {
    var erros = []

    if(req.body.categorias == 0){
        erros.push({text: "Sem categorias!"})
        
    } 
    
    
    if(erros.length > 0){
        res.redirect('/admin/postagens/add', {erros: erros})
    } else {
        const novaPostagem = {
            nome: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
    }

    new Postagem(novaPostagem).save().then(() => {
        req.flash("success_msg", "Postagem criada com sucesso!")
        res.redirect('/admin/postagens')
    }).catch((error) => {
        req.flash("error_msg", "Erro ao publicar postagem!")
        res.redirect("/admin/postagens")
        console.log(error)
    })
}
})

router.get("/postagens/remover/:id", (req, res) => {
    Postagem.deleteOne({_id: req.params.id}).lean().then((postagem) => {
       req.flash("success_msg", "Postagem deletada com sucesso!")
       res.redirect("/admin/postagens")
    }).catch((error) => {
        req.flash("error_msg", "Erro ao deletar postagem!")
        res.redirect("/admin/postagens")
    })
})

module.exports = router