import cookieParser from 'cookie-parser';
import express from 'express';
import userModel from './models/user.js';
import postModel from './models/post.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const app = express();

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());

app.get("/",(req,resp)=>
{
    resp.render("register");
})
// Saving User data
app.post("/register", async (req,resp)=>
{
    let {name, username , email, password, age} = req.body;
    // console.log(name,username);
    let find = await userModel.findOne({email});
    console.log(find);
    if(find)
        {
            
            return resp.send("Email Already exists");
        }

    bcrypt.genSalt(10,(err,salt)=>
    {
        console.log(salt);
        bcrypt.hash(password,salt,async (err,hash)=>
        {
            console.log(hash);
            let result =  await userModel.create({
                name,
                username,
                email,
                password : hash,
                age
            })
            resp.redirect("/login");
        })
    })
})
app.get("/login",(req,resp)=>
{
    resp.render("login");
})

app.post("/login", async(req,resp)=>
{
    let {email,password} = req.body;
    let oneUser = await userModel.findOne({email:req.body.email});
    if(!oneUser){
       return resp.send("No record found");
    }

    bcrypt.compare(password,oneUser.password,(err,result)=>
    
    {   
        if(result) 
            {
                let token = jwt.sign({email,id:oneUser._id},"Harshit@8406");
                console.log("This is login Token : "+token);
                resp.cookie("loginToken",token);
                resp.redirect("/profile");
                
            }
        else resp.send("Password not matched...");
    });
})

app.get("/logout",(req,resp)=>
{
    resp.clearCookie("loginToken");
    resp.redirect("/login");
});


// Protected Route
app.get("/profile",isLoggedIn,async (req,resp)=>
{
    //  const loginUserData =   await userModel.findOne({email:req.user.email});
    //  const totalUserPost = await postModel.find({user : req.user._id});

    // console.log("User created post Data : ",totalUserPost);
    // let totalUserPost = await loginUserData.populate("posts");
// console.log("Total posts : ",totalUserPost.posts);

    const user = await userModel.findById(req.user.id).populate("posts"); // here first login user will be find with all data of posts array in it using populate...
    resp.render("profile",{user});
});
app.post("/post",isLoggedIn, async (req,resp)=>
{
    let user = await userModel.findOne({email:req.user.email});  // Getting login user.
    const post = await postModel.create({
        user : user._id,  // telling to post that who is user that creating post.
        content:req.body.content});

    user.posts.push(post._id); // telling to user that post is created..
    await user.save();  //saving manually 
    resp.redirect("/profile");
})

// For like feature 
app.get("/profile/like/:id",isLoggedIn,async (req,resp)=>
{
    // let user = await userModel.findOne({email:req.user.email}).populate("posts");
    // let like = user.posts.likes.push(user._id);
    // console.log(like);
    console.log(req.params.id);
    let loginUserId = req.user.id;
    
    let post = await postModel.findById(req.params.id);
    let alreadyLiked= post.likes.includes(loginUserId);
    if(alreadyLiked)
        {
            post.likes.pull(loginUserId);
        }
        else{
            post.likes.push(loginUserId);
        }
    // post.likes.push(req.user.id);
    await post.save();
    resp.redirect("/profile");

})
// For global like feature same to same code as above
app.get("/like/:id", isLoggedIn, async (req, resp) => {
  // let user = await userModel.findOne({email:req.user.email}).populate("posts");
  // let like = user.posts.likes.push(user._id);
  // console.log(like);
  console.log(req.params.id);
  let loginUserId = req.user.id;

  let post = await postModel.findById(req.params.id);
  let alreadyLiked = post.likes.includes(loginUserId);
  if (alreadyLiked) {
    post.likes.pull(loginUserId);
  } else {
    post.likes.push(loginUserId);
  }
  // post.likes.push(req.user.id);
  await post.save();
  resp.redirect("/allPosts");
});

// For Edit feature 
app.get("/profile/edit/:id",isLoggedIn,async (req,resp)=>
{   
    let post = await postModel.findById(req.params.id);
    console.log("post data ",post);
    resp.render("edit",({post}));
    // resp.send(req.params.id);
})
app.post("/profile/edit/:id",isLoggedIn,async (req,resp)=>
{
    console.log(req.params.id);
    let Editpost = await postModel.findByIdAndUpdate(req.params.id,req.body);
    console.log(Editpost);
    resp.redirect("/profile");

    // resp.send(req.body);
})

// For Showing all posts to logged in user...
app.get("/allPosts",isLoggedIn,async (req,resp)=>
{
    let allPosts = await postModel.find({}).populate("user");
    console.log(allPosts);
    resp.render("allPosts",{allPosts});
})


// Custom Middleware for protected route.
function isLoggedIn(req,resp,next)
{
    let token = req.cookies.loginToken;
    if(token)
        {
            let data = jwt.verify(token,"Harshit@8406");  // it will give decoded data means readable data
            // console.log("Verified Data : "+data.id);
            req.user = data;    // it will assign logged in user data in req.user variable ...
            next();
        }
        else
        {
            resp.redirect("/login");
        }
}

app.listen(3200,()=>
{
    console.log("Server running on 3200 port.");
})