import styled from 'styled-components'

const StyledUploadWrapper = styled.div`
  .upload-wrapper {
    width: 300px;
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
    .file-list {
      position: relative;
      width: 300px;
      min-height: 40px;
      padding: 10px;
      border: 1px dashed #999;
      border-radius: 10px;
      overflow: hidden;
      .upload-hint {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        white-space: nowrap;
        color: #999;
      }
      .filename {
        display: flex;
        align-items: center;
        & span {
          display: inline-block;
        }
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
  .text-cutoff {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

export default StyledUploadWrapper
