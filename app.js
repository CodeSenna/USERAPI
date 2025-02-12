import express from "express";
import mongoose from "mongoose"; // Realiza a conexão com o banco.
import bcrypt from "bcrypt"; // Criptografa a senha.
import jwt from "jsonwebtoken"; // Cria e valida tokens JWT.
import dotenv from "dotenv"; // Variáveis de ambiente do arquivo .env.

import User from "./models/usuarioModel.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem-vindo a nossa API!" });
});

app.post("/auth/register", async (req, res) => {
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

  if (password !== confirmpassword) { // Corrigido: Condição para verificar se as senhas são iguais
    return res.status(442).json({ msg: "A senha e a confirmação precisam ser iguais!" });
  }

  const userExists = await User.findOne({ email: email }); // Corrigido: a sintaxe estava incorreta

  if (userExists) { // Corrigido: se o usuário já existe, retorna o erro
    return res.status(442).json({ msg: "Por favor, utilize outro e-mail." });
  }

  // Caso não haja erro, prosseguir com a criação do usuário
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Criptografando a senha

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    return res.status(201).json({ msg: "Usuário registrado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ msg: "Erro ao criar o usuário.", error: error.message });
  }
});

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