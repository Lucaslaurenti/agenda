//importo a classe TaskDAO
const TaskDAO = require('../dao/task-dao');
//instancio o objeto da classe
const taskDAO = new TaskDAO();

class TaskController{
    listar(){
        return function(req,res){
            const sessao = req.session;
            if(sessao.nome){
                taskDAO.listar(sessao.userId)
                .then(tarefas => {
                    res.render(
                        'tarefas/listar',
                        {
                            tarefas : tarefas,
                            sessao : sessao
                        }
                    );//fecha o res.render
                }).catch(erro => console.log(erro));
            }else{
                res.redirect('/');
            }
        }
    }

    formAdicionar(){
        return function(req,res){
            let sessao = req.session;
            if(sessao.nome){
                res.render('tarefas/form',{sessao: sessao, tarefa: {} });
            }else{
                res.redirect("/");//login
            }
        }
    }//fim do método formAdicionar

    adicionar(){
        return function(req,res){
            let sessao = req.session;
            let tarefa = {
                titulo : req.body.titulo,
                descricao: req.body.descricao,
                data: req.body.data == '' ? null : req.body.data.replace('T',' '),
                id_usuario : sessao.userId
            };

            if(sessao.nome){
                taskDAO.adicionar(tarefa)
                .then( () => {
                    req.flash('success',`Tarefa ${tarefa.titulo} cadastrada com sucesso`);
                    res.redirect("/tasks");
                }).catch( (erro) => {
                    req.flash('error','Erro ao cadastrar a tarefa. ' + erro);
                    res.render("tarefas/form",{sessao: sessao, tarefa: tarefa});
                })
            }else{
                res.redirect("/");
            }
        }
    }//fecha o método adicionar

    formEditar(){
        return function(req,res){
            let sessao = req.session;
            //pega o parâmetro id da tarefa da URL do navegador
            let id = req.params.id;

            if(sessao.nome){
                taskDAO.buscarPorId(sessao.userId, id)
                .then( tarefa => {
                    /*
                    Ao invés de delegar ao form o teste da data, o ideal é deixarmos que o controller faça isso
                    */
                    tarefa.data == null ? tarefa.data = '' : tarefa.data = tarefa.data.replace(' ','T');
                    res.render('tarefas/form',{sessao: sessao, tarefa: tarefa });
                }).catch( erro => {
                    req.flash('error','Erro ao buscar a tarefa.' + erro);
                    res.redirect('/tasks');
                });
                
            }else{
                res.redirect("/");//login
            }
        }
    }//fim do método formEditar

    editar(){
        return function(req,res){
            let sessao = req.session;
            //receber o id da tarefa que vamos editar
            const id = req.params.id;
            //montar o objeto json "tarefa"
            let tarefa = {
                titulo : req.body.titulo,
                descricao : req.body.descricao,

                data : req.body.data == '' ? null : req.body.data.replace('T',' '),

                id_usuario : sessao.userId,
                id : id
            };
            //só usuários autenticados podem editar
            if(sessao.nome){
                taskDAO.editar(tarefa)
                .then(() => {
                    req.flash('success',`Tarefa "${tarefa.titulo}" editada com sucesso`);
                    res.redirect('/tasks');
                }).catch( (erro) => {
                    req.flash('error',`Erro ao editar a tarefa: ${erro}`);
                    res.render('tarefas/form', {sessao : sessao, tarefa : tarefa})
                })
            }else{
                res.redirect('/');
            }
        }
    }//fim do método editar

    excluir(){
        return function(req,res){
            let sessao = req.session;
            const id = req.params.id;
            if(sessao.nome){
                taskDAO.excluir(sessao.userId,id)
                .then(
                    req.flash('success','Tarefa excluída com sucesso')
                ).catch( (erro) => 
                    req.flash('error','Erro ao excluir a tarefa: ' + erro)
                )
                res.status(200).send("ok");
            }else{
                res.redirect("/");
            }
        }
    }//fim do método excluir

    relatorioTop10(){
        return function(req,res){
            let sessao = req.session;
            if(sessao.nome && sessao.tipo == 'A'){
                taskDAO.relatorioTop10()
                .then( resultado => {
                    res.render(
                        'tarefas/report',
                        {sessao : sessao, resultado : resultado}
                    );
                }).catch(erro => console.log(erro))
            }else{
                res.redirect('/');
            }
        }
    }//fim do método relatorioTop10
}

module.exports = TaskController;