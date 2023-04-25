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
