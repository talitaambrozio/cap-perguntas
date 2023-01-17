const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database/database.js');
const Pergunta = require('./models/Pergunta.js');
const Resposta = require('./models/Resposta.js');


connection
    .authenticate()
    .then(()=>{
        console.log('Conexão feita com o banco de dados.')
    })
    .catch((msgerro) =>{
        console.log(msgerro)
    })


app.set('view engine', 'ejs');//linha que configura o EJS: diz para o express que quero usar o EJS com renderizador
app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: false})); //comando p/ body-parser traduzir p/ JS o que foi recebido pelos formularios
app.use(bodyParser.json());

app.get('/', (req, res) => {
    Pergunta.findAll({raw:true, order: [
        ['id', 'DESC']
    ]}).then(perguntas => {
        res.render('index', {
            perguntas: perguntas
        });
    });
});

app.get('/perguntar', (req, res) => {
    res.render('perguntar');
});

app.post('/salvarpergunta', (req, res)=> {
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;
    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(()=> {
        res.redirect('/');
    });
    
})

app.get('/perguntas/:id', (req, res) => {
    var id = req.params.id;
    Pergunta.findOne({where: {id: id}}).then(pergunta => {
        if(pergunta != undefined) {

            Resposta.findAll({
                where: {perguntaId: pergunta.id},
                order: [['id', 'DESC']]
            }).then(respostas => {
                res.render('pergunta', {
                    pergunta: pergunta,
                    respostas: respostas
                });
            });
        }else{
            res.redirect('/')
        }
    });
});

app.post('/responder', (req, res) => {
    var corpo = req.body.corpo;
    var perguntaId = req.body.pergunta;
    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(()=> {
        res.redirect(`/perguntas/${perguntaId}`)
    });
});
app.listen(8080, () => {
    console.log("Servidor rodando na porta 8080.");
})