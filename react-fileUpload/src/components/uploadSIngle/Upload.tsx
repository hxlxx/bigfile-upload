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
