const express = require('express')
const cors = require('cors')
const { createHash } = require('node:crypto')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const { host, staticDir } = require('./config')

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(staticDir, express.static(path.join(__dirname, './upload')))

function accessFile(path) {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

function getHashFilename(file) {
  const hash = createHash('sha256')
  hash.update(file.buffer, 'utf-8')
  const extname = path.extname(file.originalname)
  const newFilename = hash.digest('hex') + extname
  return newFilename
}

function getFiles(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        resolve([])
      } else {
        resolve(files)
      }
    })
  })
}

app.post('/upload_single', multer().single('file'), async (req, res) => {
  const file = req.file
  const newFilename = getHashFilename(file)
  const newPath = path.join(__dirname, 'upload', newFilename)
  const isFileExist = await accessFile(newPath)
  if (isFileExist) {
    res.send({
      code: 200,
      url: host + staticDir + '/' + newFilename
    })
    return
  }
  try {
    fs.writeFileSync(newPath, file.buffer)
    res.send({
      code: 200,
      url: host + staticDir + '/' + newFilename
    })
  } catch (error) {
    res.send({
      code: 400,
      message: 'upload failed'
    })
  }
})

app.get('/upload_already', async (req, res) => {
  const hash = req.query.hash
  const tempDir = path.join(__dirname, 'upload', hash)
  const isFileExist = await accessFile(tempDir)
  if (!isFileExist) {
    return res.send({
      code: 200,
      message: 'The file has already exist',
      uploaded: []
    })
  }
  const files = await getFiles(tempDir)
  res.send({
    code: 200,
    uploaded: files
  })
})

app.post('/upload_chunk', multer().single('file'), async (req, res) => {
  const filename = req.body.filename
  const file = req.file.buffer
  const tempDir = path.join(__dirname, './upload', filename.split('_')[0])
  const isDirExist = await accessFile(tempDir)
  const isFileExist = await accessFile(tempDir + path.extname(filename))
  if (isFileExist) {
    return res.send('The file is already exist')
  }
  if (!isDirExist) {
    fs.mkdir(tempDir, { recursive: true }, (err) => {
      console.log(err)
    })
  }
  const filePath = path.join(tempDir, filename)
  fs.writeFile(filePath, file, (err) => {
    console.log(err)
  })
  res.send('upload chunk successfully')
})

app.get('/upload_merge', async (req, res) => {
  const { filename } = req.query
  const filePath = path.join(__dirname, 'upload', filename)
  const isFileExist = await accessFile(filePath)
  // 如果文件已存在，直接将地址返回
  if (isFileExist) {
    return res.send({
      code: 200,
      url: `${host}${staticDir}/${filename}`
    })
  }
  const hash = filename.split('.')[0]
  const tempDir = path.join(__dirname, 'upload', hash)
  const files = await getFiles(tempDir)
  if (files.length > 0) {
    // 存在需要合并的切片
    files
      .sort((f1, f2) => {
        const reg = /_(\d+)/
        return parseInt(f1.match(reg)[1]) - parseInt(f2.match(reg)[1])
      })
      .forEach((file) => {
        // 读取临时目录下的所有切片
        const buffer = fs.readFileSync(path.join(tempDir, file))
        // 追加到 upload 目录中的对应文件中
        fs.appendFileSync(filePath, buffer)
        // 将已追加的文件删除
        fs.unlinkSync(path.join(tempDir, file))
      })
    // 删除临时目录
    fs.rmdirSync(tempDir)
    res.send({
      code: 200,
      url: `${host}${staticDir}/${filename}`
    })
  } else {
    res.send({
      code: 400,
      message: 'merge failed'
    })
  }
})

app.listen(8080, () => {
  console.log('listening on 8080')
})
