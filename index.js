require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jimp = require("jimp");
const AWS = require("aws-sdk");

const albumBucketName = process.env.albumBucketName;
const IdentityPoolId = process.env.IdentityPoolId;
const bucketRegion = process.env.bucketRegion;

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
  }),
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName },
});

function listAlbums() {
  s3.listObjects({ Delimiter: "/" }, function (err, data) {
    if (err) {
      console.error(err);
    } else {
      console.log(data);
    }
  });
}

listAlbums();

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

app.post("/upload", (req, res, next) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname + Date.now() + ".png");
    },
  });

  const upload = multer({
    storage: storage,
  }).single("file");

  upload(req, res, async (err) => {
    const { filename: image } = req.file;
    jimp.read(req.file.path, (err, img) => {
      if (err) {
        console.log(err);
        res.status(500);
      }
      const SCALE = 400 / img.bitmap.width;
      img
        .resize(img.bitmap.width * SCALE, img.bitmap.height * SCALE)
        .quality(60)
        .write(path.resolve(req.file.destination, "resized", image));
      fs.unlinkSync(req.file.path);
      res.send("SUCCESS");
    });
  });
});

app.get("/files", (req, res) =>
  res.json(fs.readdirSync("public/resized").reverse())
);

app.get("/public/:id", (req, res) => {
  const file = path.join(__dirname, `/public/resized/${req.params.id}`);
  const s = fs.createReadStream(file);
  s.on("open", () => {
    s.pipe(res);
  });
  s.on("error", () => {
    res.set("Content-Type", "text/plain");
    res.status(404).end("Not found");
  });
});
