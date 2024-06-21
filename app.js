const express = require('express');
const fs  = require('fs');
const app = express();
const path = require('path');

const directoryPath = path.join(__dirname, 'Database');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) => {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      res.status(500).send('Unable to scan directory');
      return;
    }
    
    res.render('index', { files: files });
  });
});

app.get("/read/:title",(req,res)=>{
  const title= req.params.title;
  const filePath = path.join(directoryPath,title);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).send('Error reading file');
      return;
    }
    
    res.render('view.ejs', { title: title, data: data.toString() });
  });
})


app.get('/edit/:filename',(req,res)=>{
  const filename = req.params.filename;
  const filePath = path.join(directoryPath,filename);
  fs.readFile(filePath, (err, data) => {
    res.render('edit.ejs',{filename ,data});
  })
})

app.post('/edit/:filename',(req,res)=>{
  const filename = req.params.filename;
  const filePath = path.join(directoryPath,filename);
  const data = req.body.data
  fs.writeFile(filePath,data,(err)=>{
    if (err) {
      res.status(500).send('Error writing file');
    } else {
      res.redirect('/read/' + filename);
    }
  })
})



app.get("/create",(req,res)=>{
    res.render('create.ejs');
})

app.post("/create", (req, res) => {
  let { title, data } = req.body;
  let filename = title + ".txt";
  const filePath = path.join(directoryPath, filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      res.status(409).send("File with this title already exists");
    } else {
      fs.writeFile(filePath, data, (err) => {
        if (err) {
          res.status(500).send('Error writing file');
        } else {
          res.redirect('/read/' + filename);
        }
      });
    }
  });
});
app.get("/delete/:title",(req,res)=>{
    const filename = req.params.title;
    const filePath = path.join(directoryPath,filename);

    fs.unlink(filePath, (err) => {
      if (err) {
        res.status(404).send('error');
      }
      else{
        res.redirect('/');
      }
    })
})
app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});