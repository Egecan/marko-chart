import fetch from 'isomorphic-fetch';

export function getData() {
  return fetch(`/ef`)
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
