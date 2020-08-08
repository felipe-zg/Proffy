import express from 'express';

const app = express();

app.use(express.json())


app.get('/users', (req, res)=>{
    return res.json(req.query);
})

app.post('/users', (req, res)=>{
    return res.json(req.body)
})

app.delete('/users/:id', (req, res)=>{
    return res.json(req.params)
})

app.listen(3333);