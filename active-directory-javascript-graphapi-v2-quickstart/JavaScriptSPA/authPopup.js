// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
const myMSALObj = new Msal.UserAgentApplication(msalConfig);
const accessTokenRequest = {
  scopes: ["https://storage.azure.com/user_impersonation"]
}

function signIn() {
  myMSALObj.loginPopup(loginRequest)
    .then(loginResponse => {
      console.log("id_token acquired at: " + new Date().toString());
      console.log(loginResponse);
      
      if (myMSALObj.getAccount()) {
        showWelcomeMessage(myMSALObj.getAccount());
      }
    }).catch(error => {
      console.log(error);
    });
}

function signOut() {
  myMSALObj.logout();
}

function getTokenPopup(request) {
  return myMSALObj.acquireTokenSilent(request)
    .catch(error => {
      console.log(error);
      console.log("silent token acquisition fails. acquiring token using popup");
          
      // fallback to interaction when silent call fails
        return myMSALObj.acquireTokenPopup(request)
          .then(tokenResponse => {
            return tokenResponse;
          }).catch(error => {
            console.log(error);
          });
    });
}

function seeProfile() {
  if (myMSALObj.getAccount()) {
    getTokenPopup(loginRequest)
      .then(response => {
        callMSGraph(graphConfig.graphMeEndpoint, response.accessToken, updateUI);
        profileButton.classList.add("d-none");
        mailButton.classList.remove("d-none");
      }).catch(error => {
        console.log(error);
      });
  }
}

function readMail() {
  if (myMSALObj.getAccount()) {
    getTokenPopup(tokenRequest)
      .then(response => {
        callMSGraph(graphConfig.graphMailEndpoint, response.accessToken, updateUI);
      }).catch(error => {
        console.log(error);
      });
  }
}

function test123() {
  console.log("Test123");
  myMSALObj.acquireTokenSilent(accessTokenRequest).then(function(accessTokenResponse) {
    // Acquire token silent success
    // Call API with token
    let accessToken = accessTokenResponse.accessToken;
    console.log(accessToken);

  try {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
  
    headers.append("Authorization", bearer);
    headers.append("x-ms-version", "2019-02-02");
    //change cors settings in azure portal. in the menu of the speicherkonto go to cors insert everywhere *, max aler 200
    //let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    let targetUrl = "https://blobawsi.blob.core.windows.net/?comp=list";
  
    const options = {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          "x-ms-version": "2019-02-02",
          "mode": "no-cors"
        }
    };
  
      fetch(targetUrl, options)
          .then(response => {
            return response.text();
          }).then(data => {
            console.log(data);
          });
  } catch(err) {
    console.log(err);
  } 
 
  }).catch(function (error) {
    //Acquire token silent failure, and send an interactive request
    if (error.errorMessage.indexOf("interaction_required") !== -1) {
        userAgentApplication.acquireTokenPopup(accessTokenRequest).then(function(accessTokenResponse) {
            // Acquire token interactive success
        }).catch(function(error) {
            // Acquire token interactive failure
            console.log(error);
        });
    }
    console.log(error);
  });
  
}