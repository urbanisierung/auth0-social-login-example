const config = {
  domain: "domain",
  clientId: "clientId",
  target: "target",
};

let auth0Client = null;

const configureClient = async () => {
  auth0Client = await auth0.createAuth0Client({
    domain: config.domain,
    clientId: config.clientId,
  });

  updateUI();
};

window.onload = async () => {
  await configureClient();

  const isAuthenticated = await auth0Client.isAuthenticated();

  const queryString = window.location.search;
  const parameters = new URLSearchParams(queryString);
  console.log(parameters.toString());

  if (isAuthenticated) {
    // show the gated content
    return;
  }

  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    // Process the login state
    const redirectResult = await auth0Client.handleRedirectCallback();
    updateUI();

    window.history.replaceState({}, document.title, "/");

    window.location.href = redirectResult.appState.target;
  }
};

const updateUI = async () => {
  const isAuthenticated = await auth0Client.isAuthenticated();

  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login-google").disabled = isAuthenticated;
  document.getElementById("btn-login-github").disabled = isAuthenticated;
};

const login = async (connection) => {
  const queryString = window.location.search;
  const parameters = new URLSearchParams(queryString);
  const options = {
    appState: {
      target: `${config.target}?${parameters.toString()}`,
    },
    authorizationParams: {
      connection,
      redirect_uri: window.location.origin,
    },
  };
  await auth0Client.loginWithRedirect(options);
};

const logout = () => {
  auth0Client.logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  });
};
