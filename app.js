const express = require("express");
const app = express();
const mongodbConnection = require("./config/mongoose");
const {hisabModel,ValidateHisabModel} = require("./module/hisab");
const {userModel,ValidateUserModel}  = require("./module/usermodel");
const cookie_parser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookie_parser());

const isLoggedin = (req, res, next) => {
  if (req.cookies.user) {
    next();
  } else {
    res.redirect("/login"); // Redirect to login page if user is not logged in
  }
};
app.get("/", isLoggedin, async (req, res) => {
  const user = req.cookies.user;

  try {
    const userData = await userModel.findOne({ email: user }).populate("hisab");
    if (!userData) {
      return res.status(404).send("User not found");
    }

    res.render("index", { userData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});
app.post("/signup", async (req, res) => {
  
  let {name,email,password} = req.body;

  const {error} = ValidateUserModel({name,email,password});

  if(error){
    return res.status(400).json({error: error.details[0].message});
  }
  else {
    const existingUser = await userModel.findOne({
      $or: [
          { email }, 
          { name }   
      ]
    });  
    if(existingUser){
      return res.status(400).json({error: "Email or Name already exists"});
    }
    const user = await userModel.create({ name, email, password });
    res.cookie("user", user.email);
    res.redirect("/");
  }
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.send("Complete the required fields");
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.send("User not found");
    }

    if (user.password === password) {
      res.cookie("user", user.email);
      res.redirect("/");
    } else {
      res.send("Invalid Credentials");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/read/:id", isLoggedin, async (req, res) => {
  const id = req.params.id;
  const data = await hisabModel.findById(id);
  res.render("view.ejs", { data });
});

app.get("/edit/:id", isLoggedin, async (req, res) => {
  const id = req.params.id;
  const data = await hisabModel.findById(id);
  if(!data.editable){
    return res.status(403).send({ error: "You are not authorized to edit this hisab" });
  }
  res.render("edit.ejs", { data });
});
app.post("/edit/:id", isLoggedin, async (req, res) => {
  const id = req.params.id;
  const { title, content, encrypt, shareable, editable, password } = req.body;

  const encryptBool = encrypt === "on";
  const shareableBool = shareable === "on";
  const editableBool = editable === "on";

  const existingHisab = await hisabModel.findOne({ title}); 

    if(existingHisab){
      return res.status(400).json({ error: "Title already exists" });
    }
  const validationResult = ValidateHisabModel({ title, content, password });
  // Check for validation errors
  if (validationResult && validationResult.error) {
    return res.status(400).send({ message: validationResult.error.details[0].message });
  }

  const hisab = await hisabModel.findById(id);

  if (!hisab) {
    return res.status(404).send({ error: "Hisab not found" });
  }

  if (hisab.password !== password) {
    return res.status(403).send({ error: "Incorrect password" });
  }

  hisab.content = content;
  hisab.encrypt = encryptBool;
  hisab.shareable = shareableBool;
  hisab.editable = editableBool;

  await hisab.save();
  
  res.redirect('/read/' + id);
});

app.get("/create", isLoggedin, (req, res) => {
  res.render("create.ejs");
});

app.post("/create", async (req, res) => {
  try {
    
    const user = await userModel.findOne({ email: req.cookies.user });

    // Destructure the necessary fields from the request body
    const { title, content, encrypt, shareable, editable, password } = req.body;

    // Convert string values to boolean
    const encryptBool = encrypt === "on";
    const shareableBool = shareable === "on";
    const editableBool = editable === "on";
    const existingHisab = await hisabModel.findOne({ title}); 

    if(existingHisab){
      return res.status(400).json({ error: "Title already exists" });
    }
    // Validate the data
    const validationResult = ValidateHisabModel({ title, content, password });

    // Check for validation errors
    if (validationResult && validationResult.error ) {
      return res.status(400).send({ message: validationResult.error.details[0].message });
    }

    // Create a new Hisab document
    const newHisab = new hisabModel({
      owner: user._id,
      title,
      content,
      encrypt: encryptBool,
      shareable: shareableBool,
      editable: editableBool,
      password,
      date: new Date(), // Ensure the date is set
    });

    // Save the new Hisab document
    await newHisab.save();

    // Add the new Hisab ID to the user's hisab array
    user.hisab.push(newHisab._id);
    await user.save();

    // Redirect or send success response
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});



app.get("/delete/:id", isLoggedin, async (req, res) => {
  const id = req.params.id;
  try {
    const data = await hisabModel.findByIdAndDelete(id);
    if (data) {
      res.redirect("/");
    } else {
      res.status(404).send({ error: "Document not found" });
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    res
      .status(500)
      .send({ error: "An error occurred while deleting the document" });
  }
});
app.get('/logout',(req,res)=>{
  res.clearCookie('user');
  res.redirect('/login');  
})
app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
