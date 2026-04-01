const Joi = require("joi");

const postSchema = Joi.object({
  titulo: Joi.string().min(3).required().messages({
    "string.empty": "O Título é obrigatório",
    "string.min": "Otítulo deve ter pelo menos 3 caracteres",
    "any.required": "O Título é obrigatório ",
  }),
  conteudo: Joi.string().min(5).required().messages({
    "string.empty": "O conteudo é obrigatório",
    "string.min": "O conteudo deve ter pelo menos 5 caracteres",
    "any.required": "O conteudo é obrigatório ",
  }),
});

function validarPost(req, res, next) {
  const { error } = postSchema.validate(req.body, { abortEarly: false });
  if (error) {
    console.log(error);
    return res.status(400).json({
      erro: error.details.map((e) => e.message),
    });
  }
  next();
}

module.exports = validarPost;
