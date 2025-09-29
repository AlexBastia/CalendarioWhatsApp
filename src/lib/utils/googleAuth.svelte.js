let isInitialized = $state(false);
let isSignedIn = $state(false);
let token = $state(null);
let profile = $state(null);

const CLIENT_ID = '582906442191-cr1q99uiv9g6uckisgihr3llcq0c137a.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient;

function init() {
	if (typeof google === 'undefined') {
		console.error('Google Identity Services script not loaded.');
		return;
	}

	// Initialize the OAuth client
	tokenClient = google.accounts.oauth2.initTokenClient({
		client_id: CLIENT_ID,
		scope: SCOPES,
		callback: (tokenResponse) => {
			if (tokenResponse && tokenResponse.access_token) {
				token = tokenResponse.access_token;
				isSignedIn = true;
			}
		}
	});
	isInitialized = true;
}

function signIn() {
	if (!isInitialized) {
		console.error('Auth service not initialized.');
		return;
	}
	tokenClient.requestAccessToken();
}

function signOut() {
	if (token) {
		google.accounts.oauth2.revoke(token, () => {
			isSignedIn = false;
			token = null;
			profile = null;
		});
	}
}

export const auth = {
	get isInitialized() {
		return isInitialized;
	},
	get isSignedIn() {
		return isSignedIn;
	},
	get token() {
		return token;
	},
	get profile() {
		return profile;
	},
	init,
	signIn,
	signOut
};
