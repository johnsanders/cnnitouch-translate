const authenticationData = {
	Password: 'john.sanders@warnermedia.com',
	Username: 'syracusE00!',
};
const authenticationDetails = new CognitoIdentity.AuthenticationDetails(authenticationData);
const poolData = { ClientId: '1example23456789', UserPoolId: 'us-east-1_ExaMPle' };
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
const userData = {
	Pool: userPool,
	Username: 'username',
};
const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
cognitoUser.authenticateUser(authenticationDetails, {
	onFailure: function (err) {
		alert(err);
	},
	onSuccess: function (result) {
		const accessToken = result.getAccessToken().getJwtToken();

		/* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer */
		const idToken = result.idToken.jwtToken;
	},
});
