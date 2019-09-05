let https = require ('https');

// Replace the accessKey string value with your valid access key.
let accessKey = 'c16048b101764e379c0eb54a7ca3812a';

// Replace [region], including square brackets, in the uri variable below. 
// You must use the same region in your REST API call as you used to obtain your access keys.
// For example, if you obtained your access keys from the northeurope region, replace 
// "westus" in the URI below with "northeurope".
let uri = 'westeurope.api.cognitive.microsoft.com';
let path = '/text/analytics/v2.0/sentiment';

let response_handler = function (response) {
    let body = '';

    response.on ('data', function (chunk) {
        body += chunk;
    });

    response.on ('end', function () {
        let body_ = JSON.parse (body);
        let body__ = JSON.stringify (body_, null, '  ');
        console.log (body__);
        return;
    });

    response.on ('error', function (e) {
        console.log ('Error: ' + e.message);
        return;
    });    
};

let get_sentiments = function (documents) {
    let body = JSON.stringify (documents);

    let request_params = {
        method : 'POST',
        hostname : uri,
        path : path,
        headers : {
            'Ocp-Apim-Subscription-Key' : accessKey,
        }
    };

    let req = https.request (request_params, response_handler);
    req.write (body);
    req.end ();
}
// >0.8 means good, <0.3 means bad, else means neutral
document = {
    "documents": [
        {
          "id": "1",
          "text": "Hello world"
        },
        {
          "id": "2",
          "text": "Bonjour tout le monde"
        },
        {
          "id": "3",
          "text": "La carretera estaba atascada. Había mucho tráfico el día de ayer."
        },
        {
          "id": "4",
          "text": ":) :( :D"
        }
      ]
    }
get_sentiments (document);
        