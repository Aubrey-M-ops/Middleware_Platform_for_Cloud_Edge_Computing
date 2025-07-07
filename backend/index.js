import express from 'express';
const app = express(); 
app.use(express.json());
app.get('/healthz', (_, res)=>res.json({ok:1}));
app.post('/heartbeat', (req, res)=>{
    console.log('heartbeat', req.body);
    res.json({ok:1});
});
app.listen(process.env.PORT||3000);