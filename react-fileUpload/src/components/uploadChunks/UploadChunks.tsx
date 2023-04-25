import React, { useRef, useState } from 'react'
import SparkMd5 from 'spark-md5'
import { uploadChunk, getAlreadyUploaded, uploadMerge } from '@/api'
import StyledUploadWrapper from './style'

const UploadMultiple = () => {
  const inputUploadRef = useRef<HTMLInputElement>(null)
  const [file, setFiles] = useState<File>(null as any)
  const [percent, setPercent] = useState<number>(0)
  const [uploading, setUploading] = useState<boolean>(false)

  // 代理 input:file 的点击事件
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
    return spark.end() // 文件 hash值
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    let chunkSize = 2 * 1024 * 1024 // 每一个分片的大小
    let currentChunk = 0 // 当前分片索引
    let chunks = Math.ceil(file.size / chunkSize) // 分片数量
    let alreadyUpload = [] // 已经上传的分片

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
