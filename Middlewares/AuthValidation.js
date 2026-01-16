// Server side validation 
const Joi = require('joi');

const signupValidation = (req, res, next) => {
    console.log(req.body);
    const schema = Joi.object({
      company_name: Joi.string().min(3).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(4).max(100).required(),
      field_of_work: Joi.string().min(3).max(100).required(),
      years_old: Joi.number().integer().min(0).required(),
      emp_size: Joi.number().integer().min(1).required(),
    });
  
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Bad request",
        error: error.details.map((err) => err.message),
      });
    }
  
    next();
  };

const loginValidation =(req,res,next) =>{
    const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(100).required(),
    })

    const {error} = schema.validate(req.body);

    if(error){
        return res.status(400)
            .json({message: "Bad request",error})
    }

    next();
}

module.exports= {
    signupValidation,
    loginValidation,
}