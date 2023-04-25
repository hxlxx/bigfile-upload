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
    .file-list-wrapper {
      position: relative;
      width: 300px;
      min-height: 80px;
      padding: 10px;
      border: 1px dashed #999;
      border-radius: 10px;
      overflow: hidden;
      .file-list {
        list-style: none;
        margin: 0;
        padding: 0;
        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 5px;
          border-bottom: 1px dashed #bbb;
          .filename {
            display: flex;
            align-items: center;
            & span {
              display: inline-block;
            }
          }
        }
      }
      .upload-hint {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        white-space: nowrap;
        color: #999;
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
