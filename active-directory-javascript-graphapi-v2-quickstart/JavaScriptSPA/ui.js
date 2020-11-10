// Select DOM elements to work with
const welcomeDiv = document.getElementById("welcomeMessage");
const signInButton = document.getElementById("signIn");
const signOutButton = document.getElementById('signOut');
const cardDiv = document.getElementById("card-div");
const mailButton = document.getElementById("readMail");
const profileButton = document.getElementById("seeProfile");
const profileDiv = document.getElementById("profile-div");


function showWelcomeMessage(account) {

    // Reconfiguring DOM elements
    cardDiv.classList.remove('d-none');
    welcomeDiv.innerHTML = `Welcome ${account.name}`;
    signInButton.classList.add('d-none');
    signOutButton.classList.remove('d-none');
}

function updateUITest(data){
  const email = document.createElement('text');
    email.innerHTML = data;
    profileDiv.appendChild(email);
}

function updateUI(data, endpoint) {
  console.log('Graph API responded at: ' + new Date().toString());

  if (endpoint === graphConfig.graphMeEndpoint) {
    const email = document.createElement('p');
    email.innerHTML = "<strong>Mail: </strong>" + data.userPrincipalName;
    profileDiv.appendChild(email);
  } else if (endpoint === graphConfig.graphMailEndpoint) {
      if (data.value.length < 1) {
        alert("Your mailbox is empty!")
      } else {
        const tabList = document.getElementById("list-tab");
        tabList.innerHTML = ''; // clear tabList at each readMail call
        const tabContent = document.getElementById("nav-tabContent");

        data.value.map((d, i) => {
          // Keeping it simple
          if (i < 10) {
            const listItem = document.createElement("a");
            listItem.setAttribute("class", "list-group-item list-group-item-action")
            listItem.setAttribute("id", "list" + i + "list")
            listItem.setAttribute("data-toggle", "list")
            listItem.setAttribute("href", "#list" + i)
            listItem.setAttribute("role", "tab")
            listItem.setAttribute("aria-controls", i)
            listItem.innerHTML = d.subject;
            tabList.appendChild(listItem)
    
            const contentItem = document.createElement("div");
            contentItem.setAttribute("class", "tab-pane fade")
            contentItem.setAttribute("id", "list" + i)
            contentItem.setAttribute("role", "tabpanel")
            contentItem.setAttribute("aria-labelledby", "list" + i + "list")
            contentItem.innerHTML = "<strong> from: " + d.from.emailAddress.address + "</strong><br><br>" + d.bodyPreview + "...";
            tabContent.appendChild(contentItem);
          }
        });
      }
  }
}