import { proxyUrl } from "@/utils/api";

function serializeUser(user) {
  return {
    id: user.id,
    login: user.login,
    mail: user.mail,
    firstname: user.firstname,
    lastname: user.lastname,
  };
}

async function fetchUser(site) {
  try {
    const response = await fetch(`${proxyUrl}${site.url}/my/account.json`, {
      headers: {
        "X-Redmine-API-Key": site.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return serializeUser(data.user);
  } catch (error) {
    throw new Error(`Error fetching user from ${site.url}: ${error}`);
  }
}

export default async function loadUsers(sites) {
  try {
    const promises = sites.map((site) => fetchUser(site));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    throw error;
  }
}
