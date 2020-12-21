import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { HttpClient } from '@angular/common/http';
import { InteractionRequiredAuthError, AuthError } from 'msal';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';

const GRAPH_ENDPOINT_BLOB = 'https://storage.azure.com/user_impersonation';

const accessTokenRequest = {
  scopes: ["https://storage.azure.com/user_impersonation"]
}


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile;

  constructor(private authService: MsalService, private http: HttpClient) { }

  ngOnInit() {
    this.getProfile();
  }

  getProfile() {
    this.http.get(GRAPH_ENDPOINT)
    .subscribe({
      next: (profile) => {
        this.profile = profile;
      },
      error: (err: AuthError) => {
        // If there is an interaction required error,
        // call one of the interactive methods and then make the request again.
        if (InteractionRequiredAuthError.isInteractionRequiredError(err.errorCode)) {
          this.authService.acquireTokenPopup({
            scopes: this.authService.getScopesForEndpoint(GRAPH_ENDPOINT)
          })
          .then(() => {
            this.http.get(GRAPH_ENDPOINT)
              .toPromise()
              .then(profile => {
                this.profile = profile;
              });
          });
        }
      }
    });
  }

  getContainer() {
    console.log("getContainer");
    this.authService.acquireTokenPopup({
      scopes: ["https://storage.azure.com/user_impersonation"]
    })
    .then((accessTokenResponse) => {
      let accessToken = accessTokenResponse.accessToken;
      console.log(`ACCESSTOKEN: ${accessToken}`);
      try {
        //change cors settings in azure portal. in the menu of the speicherkonto go to cors insert everywhere *, max aler 200
        //let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        let targetUrl = `https://timoblob.blob.core.windows.net/?comp=list`;
      
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
      
          fetch(targetUrl, options)
              .then(response => {
                return response.text();
              }).then(data => {
                console.log(data);
              });
      } catch(err) {
        console.log(err);
      } 
    });
  }

  //this.getProfile(); so the user does only need to authorize on test button. in app-routing the canActivate: [MsalGuard] needs
  //also be removed, otherwise the user needs to authorize for the whole path 
  getContainerNoMsalGuard() {
    this.authService.loginPopup().then(() => {
      console.log("getContainer");
      this.authService.acquireTokenPopup({
        scopes: ["https://storage.azure.com/user_impersonation"]
      })
      .then((accessTokenResponse) => {
        let accessToken = accessTokenResponse.accessToken;
        console.log(`ACCESSTOKEN: ${accessToken}`);
        try {
          //change cors settings in azure portal. in the menu of the speicherkonto go to cors insert everywhere *, max aler 200
          //let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
          let targetUrl = `https://timoblob.blob.core.windows.net/?comp=list`;
        
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
        
            fetch(targetUrl, options)
                .then(response => {
                  return response.text();
                }).then(data => {
                  console.log(data);
                });
        } catch(err) {
          console.log(err);
        } 
      });
    });
  }
}
