import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

// Cadastro
router.post("/cadastro", async (req, res) => {
  try {
    const user = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);

    const userDB = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashPassword,
      },
    });

    res.status(201).json(userDB);
  } catch (error) {
    res.status(500).json({ massege: "erro no servidor tente novamente" });
  }
});

//login

router.post("/login", async (req, res) => {
  try {
    const userInfo = req.body;
    //Busca o usuario no banco de dados
    const user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    //Verifica se o usuario existe
    if (!user) {
      return res.status(404).json({ message: "Usuario nao encontrado" });
    }

    const isMatch = await bcrypt.compare(userInfo.password, user.password);

    //verifica a senha ou compara as senhas
    if (!isMatch) {
      return res.status(400).json({ message: "senha invalida" });
    }

    // gerar o token JWT

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "erro no servidor tente novamente" });
  }
});

export default router;
