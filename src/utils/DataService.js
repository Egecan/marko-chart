import fetch from 'isomorphic-fetch';

const allowedFileTypes = ["text/csv"];

export function fileIsIncorrectFiletype(file) {
  return (allowedFileTypes.indexOf(file.type) === -1)
}

export function showInvalidFileTypeMessage(){
  window.alert("Tried to upload invalid filetype. Only " + allowedFileTypes + " is allowed");
}

export function getData() {
  return fetch(`/ef?source=google&symbols=CBA.AX,BHP.AX,TLS.AX`)
      .then(handleErrors)
      .then(response =>{
        return response.json()
      })
      //.then(function(parsedData){})
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

export function fileUpload(file){
  const formData = new FormData();
  formData.append('the_file',file)

  //return  post(url, formData,config)
  return fetch(`/upload`, {
    method: 'post',
    body: formData
  })
      .then(handleErrors)
      .then(response =>{
        return response.json()
      })
}
