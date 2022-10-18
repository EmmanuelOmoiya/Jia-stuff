const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs =  require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 4080;
app.use(cors());

let date = new Date().getFullYear() + '_' + new Date().getMonth()+1 + '_' + new Date().getDate();
let time = new Date().toLocaleTimeString().split(' ').join('_').split(':').join('_');
let fullDate = date+ '_' +time;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Videos')
    },
    filename: (req, file, cb) => {
        cb(null,time + "_"+ file.originalname)
    },
})

const upload = multer({ storage: storage })

app.post('/upload-video', upload.single('video'), (req, res)=>{
    console.log(`Video uploaded: ${req.file.filename}`)
})

app.post("/upload-video/multiple", upload.array("video", 3), (req, res)=>{
    console.log(req.files)
    res.send('multiple files upload sucessful')
})

app.get('/video/:filename', (req, res)=>{
    res.sendFile(__dirname + `/stream.html`);
})

app.get('/get-video/:filename', (req, res)=>{
    // res.sendFile(__dirname + `/stream.html`);
    // // res.sendFile(__dirname + `/Videos/${req.params.filename}`)
    const videoPath = __dirname + `/Videos/${req.params.filename}`;
    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const videoRange = req.headers.range;
    if (videoRange) {
        const parts = videoRange.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1;
        const chunksize = (end-start) + 1;
        const file = fs.createReadStream(videoPath, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
    // const range = "64165";
    // if(!range){
    //     res.status(400).send('Requires Range header');
    // } else {
    //     const videoPath = __dirname + `/Videos/${req.params.filename}`;
    //     const videoSize = fs.statSync(videoPath).size;
    
    //     const Chunk_Size = 10 ** 6;
    //     const start =  Number(range.replace(/\D/g, ""));
    //     const end = Math.min(start + Chunk_Size, videoSize - 1);
    
    
    //     // Create headers
    //     const contentLength = end - start + 1
    //     const headers = {
    //         "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    //         "Accept-Ranges": 'bytes',
    //         "Content-Length": contentLength,
    //         "Content-Type": 'video/mp4'
    //     }
    
    //     res.writeHead(206, headers)
    
    //     const videoStream = fs.createReadStream(videoPath, { start, end })
    
    //     videoStream.pipe(res)
    // }
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
    try {
        const files = fs.readdirSync('./Videos');
        files.forEach(file => {
            console.log(file)
        }) 
    } catch(err) {
        console.log(err)
    } 
})



app.listen(port, console.log(`Sever running on port ${port}`));