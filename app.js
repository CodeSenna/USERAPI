import express from "express";
import mongoose from "mongoose"; // Realiza a conexão com o banco.
import bcrypt from "bcrypt"; // Criptografa a senha.
import jwt from "jsonwebtoken"; // Cria e valida tokens JWT.
import dotenv from "dotenv"; // Variáveis de ambiente do arquivo .env.

import User from "./models/usuarioModel.js";

dotenv.config(); // Carrega as variáveis de ambiente do arq. .ENV

const app = express();

app.use(express.json());
//Rota aberta
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem-vindo a nossa API!" });
});

// Rota Privada.
app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  const user = await User.findById({ msg: "Usuário não encontrado!" });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  res.status(200).json({ user });
});

// Middlewares (Checagem do Token)
function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && autoHeader.split(" ")[1]; // Extrai o JWT do cabeçalho.

  if (!token) return res.status(401).json({ msg: "Acesso Negado!" });

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret); // Verifica se o Token é realmente válido.

    next();
  } catch (err) {
    res.status(400).json({ msg: "O Token é invalido!" });
  }
}

app.post("/auth/register", async (req, res) => {
  //POST(POSTAR)
  const { name, email, password, confirmpassword } = req.body; // Corrigido: desestruturando do req.body

  if (!name) {
    return res.status(442).json({ msg: "O nome é obrigatório!" });
  }

  if (!email) {
    return res.status(442).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(442).json({ msg: "A senha é obrigatória!" });
  }

  if (password !== confirmpassword) {
    // Corrigido: Condição para verificar se as senhas são iguais
    return res
      .status(442)
      .json({ msg: "A senha e a confirmação precisam ser iguais!" });
  }

  const userExists = await User.findOne({ email: email }); // Corrigido: a sintaxe estava incorreta

  if (userExists) {
    // Corrigido: se o usuário já existe, retorna o erro
    return res.status(442).json({ msg: "Por favor, utilize outro e-mail." });
  }

  // Caso não haja erro, prosseguir com a criação do usuário
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Criptografando a senha

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ msg: "Usuário registrado com sucesso!" });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Erro ao criar o usuário.", error: error.message });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ msg: "O e-mail deve ser preenchido!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha deve ser preenchida!" });
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    // Mudança: Corrigido de "User" para "user"
    return res.status(404).json({ msg: "Usuário não cadastrado!" });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(442).json({ msg: "Senha inválida!" }); // Corrigido a mensagem de erro
  }

  // Criar um Env secret para evitar invasões
  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id, // Cria um token JWT contendo a ID do User.
      },
      secret
    );
    res.status(200).json({ msg: "Autenticação realizada com sucesso!", token });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Credenciais
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@clusterapi.xnjzr.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAPI`
  )
  .then(() => {
    app.listen(3000, () => console.log("API rodando na porta 3000"));
    console.log("Conectado ao Banco de Dados!");
  })
  .catch((err) => console.log("Erro na conexão com o banco de dados:", err));
