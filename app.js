const express = require('express');
const fs  = require('fs');
const app = express();
const path = require('path');
const mongodbConnection = require('./config/mongoose');
const hisabModel = require('./module/hisab');
const directoryPath = path.join(__dirname, 'Database');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.get('/',async (req, res) => {
  const data = await hisabModel.find();
    res.render('index', { data });
 
});

app.get("/read/:id",async(req,res)=>{
  const id= req.params.id;
  const data = await hisabModel.findById(id);
  res.render("view.ejs",{data});
})


app.get('/edit/:id',async(req,res)=>{
  const id = req.params.id;
  const data = await hisabModel.findById(id);
  res.render('edit.ejs',{data});
})

app.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const content = req.body.content;

  if (!content) {
    return res.status(400).send({ error: 'Content is required' });
  }

  try {
    const data = await hisabModel.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );
    
    if (data) {
      res.redirect('/read/'+data._id);
    } else {
      res.status(404).send({ error: 'Document not found' });
    }
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).send({ error: 'An error occurred while updating the document' });
  }
})



app.get("/create",(req,res)=>{
    res.render('create.ejs');
})

app.post("/create",async (req, res) => {
  let { title, content } = req.body;
  const data = await hisabModel.create({
    title: title,
    content: content
  })  
  res.redirect('/read/' + data._id);
});
app.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await hisabModel.findByIdAndDelete(id);
    if (data) {
      res.redirect('/');
    } else {
      res.status(404).send({ error: 'Document not found' });
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).send({ error: 'An error occurred while deleting the document' });
  }
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});