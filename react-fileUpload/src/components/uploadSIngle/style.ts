import styled from 'styled-components'

const StyledUploadWrapper = styled.div`
  .upload-wrapper {
    width: 200px;
    padding-bottom: 10px;
    #file {
      display: none;
    }
    .upload-button-group {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
      button {
        padding: 10px 20px;
        border: none;
        border-radius: 10px;
        color: #fff;
        cursor: pointer;
        transition: all 0.3s linear;
      }
      .button-select {
        background-color: rgb(0, 156, 0);
        &:hover {
          opacity: 0.8;
        }
      }
      .button-upload {
        background-color: rgb(62, 62, 211);
        &:hover {
          opacity: 0.8;
        }
      }
    }
    .img-preview {
      position: relative;
      width: 200px;
      height: 200px;
      border: 1px dashed #999;
      border-radius: 10px;
      overflow: hidden;
      .iconfont.icon-plus {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 40px;
        color: #999;
      }
      .preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .upload-hint {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        color: #999;
      }
    }
    .progress-wrapper {
      margin-top: 10px;
      border-radius: 2px;
      overflow: hidden;
      .progress-bar {
        height: 5px;
        background-color: skyblue;
        transition: all 0.3s linear;
      }
    }
  }
`

export default StyledUploadWrapper
