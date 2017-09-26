import fetch from 'isomorphic-fetch';

export function getData() {
  return fetch(`/ef`)
      .then(handleErrors) //optional
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


/*
export function getData() {
  let result = {
    data: [],
    message: ''
  };
  return fetch(`http://markowitz-cont:5000/ef`)
      .then(response =>{
        if (response.ok) {
          response.json().then(data => {
            result.data = data;
            result.message = response.statusText;
            return result;
          });
        } else {
          result.message = 'Network response was not ok.';
          return result;
        }
      })
}
}*/