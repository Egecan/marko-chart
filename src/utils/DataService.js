import fetch from 'isomorphic-fetch';

const allowedFileTypes = ["text/csv"];

export function fileIsIncorrectFiletype(file) {
  return (allowedFileTypes.indexOf(file.type) === -1)
}

export function showInvalidFileTypeMessage(){
  window.alert("Tried to upload invalid filetype. Only " + allowedFileTypes + " is allowed");
}

export function getData(riskfree, stocks, source) {
  const url = `/ef?source=` + source + `&symbols=` + stocks +`&riskfree=` + riskfree
  return fetch(url)
      .then(handleErrors)
      .then(response =>{
        return response.json()
      })
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

export function logErrorJson(json) {
  if(json != null && ((json.EfficientPortfolios != null && json.EfficientPortfolios.error)
      || (json.CML != null && json.CML.error))) {
    console.log(json)
  }
}

export function fileUpload(file, riskfree, upload1){
  const formData = new FormData();
  formData.append('the_file', file)
  formData.append('riskfree', riskfree)

  const url = upload1 ? `/upload1` : `/upload`
  return fetch(url, {
    method: 'post',
    body: formData
  })
      .then(handleErrors)
      .then(response =>{
        return response.json()
      })
}
