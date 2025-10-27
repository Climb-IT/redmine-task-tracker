// CHECK THIS
const GOOGLE_CLIENT_ID =
  "758388732169-q35lh3a1n93gccb1fmu36i2kijv4n8ad.apps.googleusercontent.com";
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

async function getAccessTokenInteractive() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(token);
    });
  });
}

async function fetchCalendarEvents(accessToken, calendarId = "primary") {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${now}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return data.items;
}

// async function getAccessToken() {
//   try {
//     await chrome.identity.getAuthToken({ interactive: false });
//   } catch (error) {
//     await getAccessTokenInteractive();
//   }
// }

// getAccessToken();

// try {
//   const x = await chrome.identity.getAuthToken({ interactive: false });
//   console.log("HERE", x);
// } catch (error) {
//   await getAccessTokenInteractive();
// }
// CHECK THIS
