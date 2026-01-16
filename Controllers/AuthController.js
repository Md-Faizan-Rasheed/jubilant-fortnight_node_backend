const UserModels = require("../Models/User.Models");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req,res)=>{
  console.log("Received data:", req.body);

try {
    const {company_name,years_old,field_of_work,email,password,emp_size} = req.body;

    const user = await UserModels.findOne({email});
    // const user =True;
    if(user){
        return res.status(409)
            .json({message:'User is already exist , you can login ',sucess:false})
    }

    const userModel = new  UserModels({company_name,years_old,field_of_work,email,password,emp_size});

    // before saving the data we encrypt our password 
    // using bcrypt library
    userModel.password = await bcrypt.hash(password,10);

    await userModel.save();
    res.status(201)
      .json({
        message:"Signup Sucessfully",
        sucess:true
      })
} catch (error) {
    res.status(500)
    .json({
      message:"Internal Server Error",
      sucess:false
    })}
}

const login = async (req,res)=>{
try {
    const {email,password} = req.body;

    const user = await UserModels.findOne({email});
    if(!user){
        return res.status(403)
            .json({message:'Auth Failed , Email or password is Wrong ',
              sucess:false})
    }

    const isPasswordEqual = await bcrypt.compare(password,user.password);

    if(!isPasswordEqual){
      return res.status(403)
      .json({message:'Auth Failed , Email or password is Wrong ',sucess:false})
    }

    // generate JWT Token
    const jwtToken = jwt.sign({email:user.email,_id:user._id},
               process.env.JWT_SECRET,
               {expiresIn:'24h'}
    );
     // Set Cookie
     res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      sameSite: "Lax", // Change to "None" if using cross-origin requests
      path: "/", // Ensure it is accessible throughout the app
    });
    res.status(200)
      .json({
        message:"login Sucess",
        sucess:true,
        jwtToken,
        email,
        name:user.company_name,
      })
} catch (error) {
    res.status(500)
    .json({
      message:"Internal Server Error",
      sucess:false
    })}
}

// const login = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // Fake user for testing
//     const user = {
//       _id: "test_user_id",
//       email: email || "test@test.com",
//       company_name: "Test Company"
//     };

//     // Generate JWT
//     const jwtToken = jwt.sign(
//       { email: user.email, _id: user._id },
//       process.env.JWT_SECRET || "test_secret",
//       { expiresIn: "24h" }
//     );

//     // Set cookie
//     res.cookie("token", jwtToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "Lax",
//       path: "/",
//     });

//     return res.status(200).json({
//       message: "Login Success (TEST MODE)",
//       success: true,
//       jwtToken,
//       email: user.email,
//       name: user.company_name,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal Server Error",
//       success: false
//     });
//   }
// };


module.exports = {
signup,
login

}