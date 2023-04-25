import './App.css'
import Upload from './components/uploadSIngle/Upload'
import UploadMultiple from './components/uploadMultiple/UploadMultiple'
import UploadChunks from './components/uploadChunks/UploadChunks'

function App() {
  return (
    <>
      <div>
        <Upload />
        <hr />
        <UploadMultiple />
        <hr />
        <UploadChunks />
      </div>
    </>
  )
}

export default App
