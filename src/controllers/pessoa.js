const ServicoExercicio = require("../services/pessoa.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require("../config.js");

const servico = new ServicoExercicio()

class ControllerExercicio {

    async Login(req, res){
      const { email, senha } = req.body;
    
      const { dataValues: pessoa } = await servico.PegarUmPorEmail(email);
      
      if (!pessoa) {
          return res.status(401).json({ mensagem: 'Credenciais inválidas' });
      }
      console.log(pessoa.senha, senha)
      if (!(await bcrypt.compare(senha, pessoa.senha))) {
          return res.status(401).json({ mensagem: 'Credenciais inválidas' });
      }
      
      const token = jwt.sign(
          { id: pessoa.id, nome: pessoa.nome, email: pessoa.email },
          config.secret
      );
      
      res.json({ mensagem: 'Login bem-sucedido', token });
    }

    async PegarUm(req, res){
      const { nome } = req.session
      try {
        const id = req.params.id

        const result = await servico.PegarUm(id)

        if(!result) {
          return res.status(404).json({ message: "Lamentamos, " + nome + ", id não encontrado!" });
        }
        
        res.status(200).json(result);
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message}); 
      }
    }

    async PegarTodos(_, res){
      try {
        const result = await servico.PegarTodos()

        res.status(201).json(result); 
      } catch (error) {
        res.status(500).json({ message: error.message});
      }
    }

    async Adicionar(req, res){
      try {
        const { pessoa } = req.body

        await servico.Adicionar(pessoa)
        
        res.status(201).json({ message: "Adicionado com sucesso!"});
      } catch (error) {
        if(error.parent.code === "ER_DUP_ENTRY") {
          res.status(500).json({ message: "Email já cadastrado!"});
        }
        res.status(500).json({ message: error.parent.message || error.message});
      }
    }

    async AdicionarAdmin(req, res){
      try {
        const { pessoa } = req.body

        await servico.Adicionar(pessoa, true)
        
        res.status(201).json({ message: "Adicionado com sucesso!"});
      } catch (error) {
        if(error.parent.code === "ER_DUP_ENTRY") {
          res.status(500).json({ message: "Email já cadastrado!"});
        }
        res.status(500).json({ message: error.parent.message || error.message});
      }
    }

    async Alterar(req, res){
      try {
        const id = req.params.id
        const nome = req.body.nome
    
        await servico.Alterar(id, nome)
          
        res.status(200).json({ message: "Alterado com sucesso!"});
      } catch (error) {
        res.status(500).json({ message: error.errors.message || error.message});
        
      }
    }

    async Deletar(req, res){
      try {
        const id = req.params.id

        await servico.Deletar(id)
          
        res.status(200).json({ message: "Deletado com sucesso!"});
      } catch (error) {
        res.status(500).json({ message: error.message});
        
      }
    }

}

module.exports = ControllerExercicio