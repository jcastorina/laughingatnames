require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const multerS3 = require("multer-s3");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

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

app.post("/upload", (req, res, next) => {
  const upload = multer({
    storage: multerS3({
      s3,
      bucket: albumBucketName,
      key: function (req, file, cb) {
        cb(null, file.originalname + Date.now() + ".png"); //use Date.now() for unique file keys
      },
    }),
  }).single("file");

  upload(req, res, async (err) => {
    if (err) res.status(500);
    res.send("successfully uploaded file");
  });
});

app.get("/files", async (req, res) => {
  const filenamesArray = await new Promise((resolve, reject) => {
    s3.listObjects({ Delimiter: "/" }, function (err, data) {
      if (err) {
        console.error(err);
        reject([]);
      } else {
        resolve(data.Contents.map((v) => v.Key));
      }
    });
  });
  const signedUrls = await new Promise((resolve, reject) => {
    const urls = filenamesArray.map((v) => {
      return s3.getSignedUrl("getObject", {
        Bucket: albumBucketName,
        Key: v,
        Expires: 60 * 5,
      });
    });
    resolve(urls);
  });
  return res.json(signedUrls);
});

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
