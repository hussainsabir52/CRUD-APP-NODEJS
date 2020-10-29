const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const mysql = require('mysql');
const session = require('express-session');
const { reset } = require('nodemon');

const conn = new mysql.createConnection(
   {
       host: 'localhost',
       user: 'hussain',
       password: '2010',
       database: 'crud_db'
   } 
);

conn.connect((err)=>{
    if(err)
    throw err;
    console.log('Mysql Connection Success');
})
const app = express();
const partialpath=path.join(__dirname,'partials');

hbs.registerPartials(partialpath);

app.set('views',path.join(__dirname,'views'));

app.set('view engine','hbs');

app.use(session({secret:'secretKey'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/assets',express.static(__dirname+'/public'));

app.get('/products',(req, res) => {
    if(req.session.loggedin){
        let sql = "SELECT * FROM product where user_id="+req.session.userid+"";
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
      res.render('product_view',{
        results: results,
        username:req.session.userid
      });
    });
   }
   else{
       res.redirect('login');
   }
    
  });

 
app.get('/product/:id',(req,res)=>{

    if(req.session.loggedin)
    {
        let sql = "select * from product where product_id=?";
    let query = conn.query(sql,[req.params.id],(err,results)=>{
        if(err)
        throw err;  
    res.render('single_product',{
        results:results,
        Website_name:'CRUD Application'
    });
    });
    }
    else
    {
        res.redirect('/login');
    }

});

app.get('/login',(req,res)=>{
    res.render('login',{message:'Login to view products'});
});

app.get('/signup',(req,res)=>{
    res.render('signup');
});
app.post('/login',(req,res)=>{
    const sql="select * from userdata where username='"+req.body.username+"' and password='"+req.body.password+"'";
    conn.query(sql,(err,results)=>{
        if(err)
        throw err;
        else if(results.length!=0){
            console.log(results);
            req.session.loggedin=true;
            req.session.username=req.body.username;
            req.session.userid=results[0].user_id;
            res.redirect('/products');
        }
        else{
            res.render('login',{message:"Wrong Username or Password"})  
        }
    })
})

app.post('/signup',(req,res)=>{

    const data={username:req.body.username,password:req.body.password};
    const sql="insert into userdata set ?";
    const query = conn.query(sql,data,(err,results)=>{
        if(err)
        throw err;
        res.redirect('/login');
    });
});

app.post('/save',(req,res)=>{
    const data = {product_name:req.body.product_name,product_price:req.body.product_price,user_id:req.session.userid};
    const sql = 'insert into product set ?';
    const query = conn.query(sql,data,(err,results)=>{
        if(err)
        throw err;
        res.redirect('/products');
    });
});

app.post('/update',(req,res)=>{
    const sql = "update product set product_name='"+req.body.product_name+"',product_price='"+req.body.product_price+"' where product_id='"+req.body.product_id+"' and user_id='"+req.session.userid+"'";
    conn.query(sql,(err,results)=>{
        if(err)
        throw err;
        res.redirect('/products');
    });
});

app.post('/delete',(req,res)=>{
    const sql="delete from product where product_id='"+req.body.product_id+"' and user_id='"+req.session.userid+"'";
    conn.query(sql,(err,results)=>{
        if(err)
        throw err;
        res.redirect('/products');
    });
});


app.get('/logout',(req,res)=>{
    req.session.loggedin=false;
    res.redirect('/products');
})
app.listen('3000',()=>{
    console.log('Running on port 3000');
});