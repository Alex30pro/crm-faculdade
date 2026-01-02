const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config'); 

const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const emailTratado = email.trim().toLowerCase();
        const usuario = await db('usuarios').where(db.raw('LOWER(email) = ?', [emailTratado])).first();

        if (!usuario || !usuario.is_active) {
            return res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo.' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        
        const payload = { id: usuario.id, email: usuario.email, role: usuario.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            message: 'Login bem-sucedido!',
            token: token,
            usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role }
        });

    } catch (error) {
        console.error("ERRO NO CONTROLLER DE LOGIN:", error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
}

const mudarSenha = async (req, res) => {
    try {
        const { senhaAtual, novaSenha } = req.body;

        const usuarioId = req.user.id;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias.' });
        }

        const usuario = await db('usuarios').where({ id: usuarioId }).first();
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const senhaAtualValida = await bcrypt.compare(senhaAtual, usuario.senha_hash);
        if (!senhaAtualValida) {
            return res.status(400).json({ message: 'A senha atual está incorreta.' });
        }

        const saltRounds = 10;
        const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);

        await db('usuarios').where({ id: usuarioId }).update({
            senha_hash: novaSenhaHash
        });

        res.json({ message: 'Senha alterada com sucesso!' });

    } catch (error) {
        console.error("Erro no controller ao mudar a senha:", error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};

const register = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const usuarioExistente = await db('usuarios').where({ email }).first();
        if (usuarioExistente) {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        await db('usuarios').insert({
            nome,
            email,
            senha_hash: senhaHash 
        });

        res.status(201).json({ message: 'Usuário criado com sucesso!' });

    } catch (error) {
        console.error("Erro no registro:", error);
        res.status(500).json({ message: 'Erro interno ao tentar registrar usuário.' });
    }
};

module.exports = {
    login,
    mudarSenha,
    register
};
