import fetch from 'isomorphic-fetch';

const allowedFileTypes = ["text/csv"];

export function fileIsIncorrectFiletype(file) {
  return (allowedFileTypes.indexOf(file.type) === -1)
}

export function showInvalidFileTypeMessage(){
  window.alert("Tried to upload invalid filetype. Only " + allowedFileTypes + " is allowed");
}

export function getData(riskfree) {
  const url = `/ef?source=google&symbols=CBA.AX,BHP.AX,TLS.AX&riskfree=` + riskfree
  return fetch(url)
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

export function fileUpload(file, riskfree){
  const formData = new FormData();
  formData.append('the_file', file)
  formData.append('riskfree', riskfree)

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
