var graph = require('@microsoft/microsoft-graph-client');

function getAuthenticatedClient(accessToken) {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: (done) => {
      done(null, accessToken.accessToken);
    }
  });

  return client;
}

export async function getUserDetails(accessToken) {
  const client = getAuthenticatedClient(accessToken);

  const user = await client.api('/me').get();
  return user;
}

export async function getUserPresence(accessToken, userId) {
  const client = getAuthenticatedClient(accessToken);

  const presence = await client.api('/users/'+userId+'/presence')
  .version("beta")
  .get();
  return presence;
}

export async function getEvents(accessToken) {
  const client = getAuthenticatedClient(accessToken);

  const events = await client
    .api('/me/events')
    .select('subject,organizer,start,end,bodyPreview,location,attendees')
    .orderby('createdDateTime DESC')
    .get();

  return events;
}

export async function getUsers(accessToken) {
  const client = getAuthenticatedClient(accessToken);

  const users = await client
    .api('/users')
    .select('businessPhones,displayName,givenName,id,jobTitle,mail,mobilePhone,officeLocation,preferredLanguage,surname,userPrincipalName')
    .get();

  // console.log(users.value)
  for (let i = 0; i < users.value.length; i++) {
    // console.log(i);
    await getUserPresence(accessToken, users.value[i].id).then(val => {
      // console.log(val);
      users.value[i].availability = val.availability;
      users.value[i].activity = val.activity;
    });
  }
  // console.log(users.value)

  return users;
}