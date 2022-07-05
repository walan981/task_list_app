import express from "express"
import path from 'path'
import { fileURLToPath } from 'url';
import ejs from 'ejs'
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
app.use(express.json());

//integration with forms 
app.use(bodyParser.json()); //support JSON-encoded bodies
app.use(bodyParser.urlencoded({ //support URL-encoded bodies
    extended:true
}))

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.engine('html', ejs.renderFile)
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'));


//will read the ./public/list.json file and return data
function jsonReader(filePath, cb){  //cb: callback
    fs.readFile(filePath, (err, jsonData)=>{
        if(err){
            return cb && cb(err);
        }
        try{
            const data = JSON.parse(jsonData);
            return cb && cb(null, data);
        }catch(err){
            return cb && cb(err);
        }
    })
}

app.get('/',(req,res)=>{
    jsonReader("./public/list.json", (err,data)=>{
        if(err){
            console.log(err);
            return;
        }
        const tasks = [];
        console.log(data);
        for(let i = 0; i<data.List.length; i++){
            console.log(data.List[i]);
            tasks.push(data.List[i]);
        }
        console.log(tasks)
        res.render('index',{taskList: tasks}) //dynamic info on static html pages
    })
})


app.post('/post',(req,res)=>{
    jsonReader("./public/list.json", (err,data)=>{
        if(err){
            console.log(err);
            return;
        }
        data['List'].push(req.body.task);
        const tasks = [];
        console.log(data);
        for(let i = 0; i<data.List.length; i++){
            console.log(data.List[i]);
            tasks.push(data.List[i]);
        }
        fs.writeFile('./public/list.json', JSON.stringify(data, null, 2), err=>{
            if(err){
                    console.log(err);
                }else{
                     return data;
                    }                           
        })
            res.redirect('http://localhost:3000');
            res.render('index',{taskList: tasks});
    })

})


app.get('/delete/:id/:value/',(req,res)=>{
    jsonReader("./public/list.json", (err,data)=>{
        if(err){
            console.log(err);
            return;
        }
        data['List'].splice(req.params.id, 1);
        console.log(req.params);
        const tasks = [];
        console.log(data);
        for(let i = 0; i<data.List.length; i++){
            console.log(data.List[i]);
            tasks.push(data.List[i]);
        }
        fs.writeFileSync('./public/list.json', JSON.stringify(data, null, 2), err=>{
            if(err){
                    console.log(err);
                }else{
                     return data;
                    }               
        }) 
        res.redirect('http://localhost:3000');
        //res.render('index',{taskList: tasks})
    })
})

const PORT = 3000;
app.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`);
})