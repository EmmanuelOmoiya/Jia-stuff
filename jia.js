const express= require("express");
const multer = require("multer");
const fs = require('fs');
const app = express();
const path = require('path');


let name;


const fileStorageEngine= multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "./videos")
    },

    filename:(req, file, cb) => {
        cb(null, file.originalname)
    }

})
const upload = multer({ storage: fileStorageEngine });



app.post("/single", upload.single("video"), (req,res) =>{
    console.log(req.file);
    res.send("single file upload sucess");
});

app.post( "/multiple", upload.array("videos", 3), (req,res)=>{
    console.log(req.files)
    res.send('multiple files upload sucessful')
})




app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('/video', (req, res) => {
    const range = "64165"
    if (!range)
        res.status(400).send('Error')
    
        fs.readdir(
            path.resolve(__dirname, 'videos'),
            (err, files) => {
              if (err) throw err;
              
              for (let file of files) {
                name =file;
              }
            }
          );
    const videoPath = `videos/${name}`
    const videoSize = fs.statSync(videoPath).size

    const chunkSize = 10 ** 6
    // bytes=64165
    const start = Number(range.replace(/\D/g, ''))
    const end = Math.min(start + chunkSize, videoSize - 1)
    const contentLength = end - start + 1
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": 'bytes',
        "Content-Length": contentLength,
        "Content-Type": 'video/mp4'
    }

    res.writeHead(206, headers)

    const videoStream = fs.createReadStream(videoPath, { start, end })

    videoStream.pipe(res)
})


 
const port=process.env.PORT||3000;
app.listen(port, ()=>
    console.log(`listing on ${port} ...`)
)