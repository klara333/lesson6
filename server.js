const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

app.get('/', (req, res) => {
  res.json({health: 'OK'});
})

app.post('/upload/base64', (req, res) => {
  try {
    const base64Data = req.body.data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `image_${Date.now()}.png`;

    fs.writeFileSync(`./public/images/${fileName}`, buffer);

    const imageUrl = `${req.protocol}://${req.get('host')}/images/${fileName}`;
    res.json({ url: imageUrl });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/upload/formdata', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded.');
    }

    const fileName = `image_${Date.now()}.png`;
    fs.writeFileSync(`uploads/${fileName}`, req.file.buffer);

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    res.json({ url: imageUrl });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});