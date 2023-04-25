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
