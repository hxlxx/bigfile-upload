# 简单模拟的文件上传

(大致实现了功能，错误捕获之类的也没有太过深究...)

## 前端 vite + react + ts

api

```ts
import axios, { AxiosProgressEvent } from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:8080'
})

export const uploadSingle = (
  data: any,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
  return instance.post('/upload_single', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  })
}

export const getAlreadyUploaded = (hash: string) => {
  return instance.get(`/upload_already?hash=${hash}`)
}

export const uploadChunk = (data: any) => {
  return instance.post('/upload_chunk', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const uploadMerge = (filename: string) => {
  return instance.get(`/upload_merge?filename=${filename}`)
}

```

### 1.单文件上传

使用 FormData 进行数据传输

请求头需要设置 "Content-Type: multipart/form-data"

```tsx
import React, { useRef, useState } from 'react'
import { uploadSingle } from '@/api'
import StyledUploadWrapper from './style'
import { AxiosProgressEvent } from 'axios'

const Upload = () => {
  const inputUploadRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | File[]>(null as any)
  const [imgUrl, setImgUrl] = useState<string>('')
  const [percent, setPercent] = useState<number>(0)
  const [uploading, setUploading] = useState<boolean>(false)

  const handleSelectFile = () => {
    const upload = inputUploadRef.current!
    upload.click()
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file as File)
    const { data } = await uploadSingle(formData, (e: AxiosProgressEvent) => {
      // 进度监听
      const { loaded, total = 1 } = e
      setPercent(Math.floor((loaded / total) * 100))
    })
    if (data.code === 200) {
      setImgUrl('')
      setFile(null as any)
      console.log(data)
      formData.delete('file')
    }
    setPercent(0)
    setUploading(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }
  // 拖拽上传
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const data = e.dataTransfer.files[0]
    setFile(data)
    const fr = new FileReader()
    fr.readAsDataURL(data)
    fr.onload = () => {
      setImgUrl(fr.result as string)
    }
  }

  const handleChangeFile = () => {
    const upload = inputUploadRef.current!
    const file = upload.files?.[0]
    if (file) {
      setFile(file)
      const fr = new FileReader()
      fr.readAsDataURL(file)
      fr.onload = () => {
        setImgUrl(fr.result as string)
      }
    }
  }

  return (
    <StyledUploadWrapper>
      <div className="upload-wrapper">
        <div>
          <input
            type="file"
            name="file"
            id="file"
            multiple
            ref={inputUploadRef}
            onChange={handleChangeFile}
          />
        </div>
        <div className="upload-button-group">
          <button className="button-select" onClick={handleSelectFile}>
            Select
          </button>
          <button className="button-upload" onClick={handleUpload}>
            upload
          </button>
        </div>
        <div
          className="img-preview"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!file && <i className="iconfont icon-plus"></i>}
          {file && <img src={imgUrl} className="preview" />}
          {!file && <div className="upload-hint">drop your file here!</div>}
        </div>
        {uploading && (
          <div className="progress-wrapper">
            <div
              className="progress-bar"
              style={{ width: percent + '%' }}
            ></div>
          </div>
        )}
      </div>
    </StyledUploadWrapper>
  )
}

export default Upload
```

### 2.多文件上传

(多次单文件上传...)

input 添加 multiple 字段实现文件多选

```tsx
import React, { useRef, useState } from 'react'
import { uploadSingle } from '@/api'
import StyledUploadWrapper from './style'

const UploadChunks = () => {
  const inputUploadRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  // 用数组保存每个文件的上传进度
  const [progress, setProgress] = useState<number[]>([])

  const handleSelectFile = () => {
    const upload = inputUploadRef.current!
    upload.click()
  }

  const handleUpload = async () => {
    if (!files.length) return
    const tasks = files.map((file, index) => {
      const fm = new FormData()
      fm.append('file', file)
      return new Promise((resolve, reject) => {
        return uploadSingle(fm, (e) => {
          const { loaded, total = 1 } = e
          const percent = Math.round((loaded / total) * 100)
          progress[index] = percent
          setProgress([...progress])
        })
          .then((res) => {
            resolve(res)
          })
          .catch(() => {
            reject({
              message: `${file.name} upload failed`
            })
          })
          .finally(() => {
            progress[index] = 100
            setProgress([...progress])
          })
      })
    })
    const res = await Promise.all(tasks)
    console.log(res)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }
  // 拖拽上传
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = [...e.dataTransfer.files]
    setFiles(files)
    setProgress(files.map(() => 0))
  }

  const handleChangeFile = () => {
    const upload = inputUploadRef.current!
    const files = [...upload.files!]
    setFiles(files)
    setProgress(files.map(() => 0))
  }

  return (
    <StyledUploadWrapper>
      <div className="upload-wrapper">
        <div>
          <input
            type="file"
            name="file"
            id="file"
            multiple
            ref={inputUploadRef}
            onChange={handleChangeFile}
          />
        </div>
        <div className="upload-button-group">
          <button className="button-select" onClick={handleSelectFile}>
            Select
          </button>
          <button className="button-upload" onClick={handleUpload}>
            upload
          </button>
        </div>
        <div
          className="file-list-wrapper"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {files.length > 0 && (
            <ul className="file-list">
              {files.map((file, index) => (
                <li key={file.name} className="file-item">
                  <span className="filename">
                    <span className="text-cutoff">
                      {file.name.split('.')[0]}
                    </span>
                    <span>.{file.name.split('.')[1]}</span>
                  </span>
                  <span>{progress[index]}%</span>
                </li>
              ))}
            </ul>
          )}
          {!files.length && (
            <div className="upload-hint">drop your file here!</div>
          )}
        </div>
      </div>
    </StyledUploadWrapper>
  )
}

export default UploadChunks
```

### 3.大文件分片上传、秒传、断点续传

分片：File 对象继承自 Blob，具有 slice 方法，通过 slice 方法实现分片。分片后可以通过 hash 值 + 索引作为表示方便后续合并分片

秒传：根据文件 hash 值判断，如果文件没有变化则直接返回文件

断点续传：在服务器端保存有已经上传的分片，客户端上传时先从服务器获取已经上传的分片信息，后续只需要上传未上传的分片即可

```tsx
import React, { useRef, useState } from 'react'
import SparkMd5 from 'spark-md5'
import { uploadChunk, getAlreadyUploaded, uploadMerge } from '@/api'
import StyledUploadWrapper from './style'

const UploadMultiple = () => {
  const inputUploadRef = useRef<HTMLInputElement>(null)
  const [file, setFiles] = useState<File>(null as any)
  const [percent, setPercent] = useState<number>(0)
  const [uploading, setUploading] = useState<boolean>(false)

  const handleSelectFile = () => {
    const upload = inputUploadRef.current!
    upload.click()
  }

  // 将文件按照固定大小分片
  const sliceChunk = (file: File, chunkSize: number, currentChunk: number) => {
    const start = currentChunk * chunkSize
    const end = (currentChunk + 1) * chunkSize
    return file.slice(start, end)
  }
  // 获取文件 hash 值
  const getFileHash = (file: File, chunkSize: number) => {
    let currentChunk = 0
    const chunks = Math.ceil(file.size / chunkSize)
    const spark = new SparkMd5.ArrayBuffer() // 用于生成文件 hash
    const fr = new FileReader()

    // 每当分片后就将分片内容转为 arrayBuffer，用于生成文件 hash
    const next = () => {
      fr.readAsArrayBuffer(sliceChunk(file, chunkSize, currentChunk))
    }
    fr.onload = () => {
      currentChunk++
      if (currentChunk > chunks) return
      spark.append(fr.result as ArrayBuffer)
      next()
    }
    fr.onerror = () => {
      console.log('sth wrong!')
    }
    next()
    return spark.end() // 文件 hash值 --- 秒传
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    let chunkSize = 2 * 1024 * 1024 // 每一个分片的大小
    let currentChunk = 0 // 当前分片索引
    let chunks = Math.ceil(file.size / chunkSize) // 分片数量
    let alreadyUpload = [] // 已经上传的分片 --- 断点续传

    const fileHash = getFileHash(file, chunkSize)
    const extname = file.name.match(/(\.\w+)$/i)?.[1] // 获取文件后缀名

    const { data } = await getAlreadyUploaded(fileHash)
    alreadyUpload = data.uploaded

    const tasks = [] // 保存每个分片的上传操作
    currentChunk = 0 // 重置索引，进行分片上传
    while (currentChunk < chunks) {
      const filename = `${fileHash}_${currentChunk}${extname}`
      // 当切片已经上传就不再上传
      if (!alreadyUpload.includes(filename)) {
        const chunk = sliceChunk(file, chunkSize, currentChunk)
        const fm = new FormData()
        fm.append('file', chunk)
        fm.append('filename', filename)
        tasks.push(
          new Promise((resolve, reject) => {
            uploadChunk(fm)
              .then((res) => {
                resolve(res)
                let done =
                  alreadyUpload.length > currentChunk
                    ? alreadyUpload.length
                    : currentChunk
                setPercent(Math.round((done / chunks) * 100))
              })
              .catch((err) => reject(err))
          })
        )
      }
      currentChunk++
    }

    Promise.all(tasks)
      .then(async () => {
        // 全部成功之后，通知切片合并
        const { data } = await uploadMerge(fileHash + extname)
        console.log(data)
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setFiles(null as any)
        inputUploadRef.current!.value = ''
        setPercent(0)
        setUploading(false)
      })
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const data = e.dataTransfer.files?.[0]
    setFiles(data)
  }

  const handleChangeFile = () => {
    const upload = inputUploadRef.current!
    const file = upload.files?.[0]
    console.log(file)
    if (file) {
      setFiles(file)
    }
  }

  return (
    <StyledUploadWrapper>
      <div className="upload-wrapper">
        <div>
          <input
            type="file"
            name="file"
            id="file"
            ref={inputUploadRef}
            onChange={handleChangeFile}
          />
        </div>
        <div className="upload-button-group">
          <button className="button-select" onClick={handleSelectFile}>
            Select
          </button>
          <button className="button-upload" onClick={handleUpload}>
            upload
          </button>
        </div>
        <div
          className="file-list"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {file && (
            <span className="filename">
              <span className="text-cutoff">{file.name.split('.')[0]}</span>
              <span>.{file.name.split('.')[1]}</span>
            </span>
          )}
          {!file && <div className="upload-hint">drop your file here!</div>}
        </div>
        {uploading && (
          <div className="progress-wrapper">
            <div
              className="progress-bar"
              style={{ width: percent + '%' }}
            ></div>
          </div>
        )}
      </div>
    </StyledUploadWrapper>
  )
}

export default UploadMultiple
```

## 后端 node + express

```js
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
```

