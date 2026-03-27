const express = require("express");
const pool = require("./config/db");

const app = express();
app.use(express.json());

function formatarData(data) {
  return new Date(data).toLocaleString("pt-BR", {
    timeZone: "America/Bahia",
  });
}

app.get("/", (req, res) => {
  res.send("<h1>Rede Social!</h1>");
});

// GET - usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        *
      FROM usuarios;
    `);
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar postagens" });
  }
});

// GET DOS POSTS
app.get("/posts", async (req, res) => {
  try {
    const resultado = await pool.query(`
        SELECT
            usuarios.id AS usuarios_id,
            usuarios.nome,
            post.conteudo,
            post.criado_em,
            post.id AS post_id
        FROM post
        JOIN usuarios
        ON post.usuario_id = usuarios.id
        ORDER BY post.criado_em DESC
        `);

    const dados = resultado.rows.map((post) => ({
      ...post,
      criado_em: formatarData(post.criado_em),
    }));

    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar postagens" });
  }
});

// Criando a Rota POST
app.post("/posts", async (req, res) => {
  try {
    const { titulo, conteudo, usuario_id } = req.body;
    const resultado = await pool.query(
      `
      INSERT INTO post (titulo, conteudo, usuario_id)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [titulo, conteudo, usuario_id],
    );
    res.status(201).json({
      mensagem: "Post criado com sucesso",
      post: resultado.rows[0],
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao criar postagem",
    });
  }
});

//  Criado rota PUT - Atualização

app.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, conteudo } = req.body;

    const resultado = await pool.query(
      `UPDATE post SET titulo=$1, conteudo=$2 WHERE id=$3 RETURNING *`,
      [titulo, conteudo, id],
    );
    res.status(200).json({
      mensagem: "Post atualizado com sucesso",
      post: resultado.rows[0],
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao atualizar post",
    });
  }
});

// ROTA DELETE
app.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM post WHERE id=$1 RETURNING *`,
      [id],
    );

    res.json({
      mensagem: "Post deletado com sucesso",
      post: resultado.rows[0],
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao deletar post",
    });
  }
});

module.exports = app;
