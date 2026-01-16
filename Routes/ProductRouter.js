const ensureAuthenticated = require('../Middlewares/Auth');

const router =require('express').Router();


router.get('/',ensureAuthenticated,(req,res) =>{
    console.log("Logined user details",req.user);
    res.status(200).json([
        {
            name:"moblie",
            price:1000,
        },
        {
            name:"tew",
            price:2343,
        }
    ]
)
})
// router.post('/login',loginValidation,login)

module.exports = router;