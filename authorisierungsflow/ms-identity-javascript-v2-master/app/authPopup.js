// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
const myMSALObj = new msal.PublicClientApplication(msalConfig);

const accessTokenRequest = {
    scopes: ["https://storage.azure.com/user_impersonation"]
  }

let username = "";

function loadPage() {
    /**
     * See here for more info on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    const currentAccounts = myMSALObj.getAllAccounts();
    if (currentAccounts === null) {
        return;
    } else if (currentAccounts.length > 1) {
        // Add choose account code here
        console.warn("Multiple accounts detected.");
    } else if (currentAccounts.length === 1) {
        username = currentAccounts[0].username;
        showWelcomeMessage(currentAccounts[0]);
    }
}

function handleResponse(resp) {
    if (resp !== null) {
        username = resp.account.username;
        showWelcomeMessage(resp.account);
    } else {
        loadPage();
    }
}

function signIn() {
    myMSALObj.loginPopup(loginRequest).then(handleResponse).catch(error => {
        console.error(error);
    });
}

function signOut() {
    const logoutRequest = {
        account: myMSALObj.getAccountByUsername(username)
    };

    myMSALObj.logout(logoutRequest);
}

function getTokenPopup(request) {
    /**
     * See here for more info on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    request.account = myMSALObj.getAccountByUsername(username);
    
    return myMSALObj.acquireTokenSilent(request).catch(error => {
        console.warn("silent token acquisition fails. acquiring token using popup");
        if (error instanceof msal.InteractionRequiredAuthError) {
            // fallback to interaction when silent call fails
            return myMSALObj.acquireTokenPopup(request).then(tokenResponse => {
                console.log(tokenResponse);
                return tokenResponse;
            }).catch(error => {
                console.error(error);
            });
        } else {
            console.warn(error);   
        }
    });
}

function seeProfile() {
    getTokenPopup(loginRequest).then(response => {
        callMSGraph(graphConfig.graphMeEndpoint, response.accessToken, updateUI);
        profileButton.classList.add('d-none');
        mailButton.classList.remove('d-none');
    }).catch(error => {
        console.error(error);
    });
}

function readMail() {
    getTokenPopup(tokenRequest).then(response => {
        callMSGraph(graphConfig.graphMailEndpoint, response.accessToken, updateUI);
    }).catch(error => {
        console.error(error);
    });
}

function getBlobContainer(storageName){
    getTokenPopup(accessTokenRequest).then(response => {
        let accessToken = response.accessToken;
        console.log(accessToken);

        let targetUrl = `https://${storageName}.blob.core.windows.net/?comp=list`;

        const headers = new Headers();
        const bearer = `Bearer ${accessToken}`;
        var d = new Date();
        let dst = d.toUTCString();
        headers.append("Authorization", bearer);
        headers.append("x-ms-version", "2019-02-02");
        headers.append("x-ms-date", dst);
        headers.append("mode", "no-cors")
    
        const options = {
            method: "GET",
            headers: headers
        };

        /*const options = {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${arr}`,
          "x-ms-version": "2019-02-02",
          "mode": "no-cors"
        } */
      fetch(targetUrl, options)
          .then(response => {
            return response.text();
          }).then(data => {
            console.log(data);
          });
    }).catch(error => {
        console.error(error);
    });
}

function uploadBlob(storageName){
    getTokenPopup(accessTokenRequest).then(response => {
        let accessToken = response.accessToken;

        const headers = new Headers();
        const bearer = `Bearer ${accessToken}`;
        var d = new Date();
        let dst = d.toUTCString();
        headers.append("Authorization", bearer);
        headers.append("x-ms-version", "2019-02-02");
        headers.append("x-ms-date", dst);
        headers.append("mode", "no-cors");
        headers.append("Content-Length", 0);
        headers.append("x-ms-blob-type", "BlockBlob");
        const options = {
            method: "PUT",
            headers: headers
        };

        let targetUrl = `https://${storageName}.blob.core.windows.net/videos/blob_${dst}`;
      fetch(targetUrl, options)
          .then(response => {
            return response;
          }).then(data => {
            if ( data.status == 201 ) {
                console.log(`Blob: blob_${dst} uploaded`);
            }
          });
    }).catch(error => {
        console.error(error);
    });
}

loadPage();
