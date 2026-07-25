const path = require("path");
const axios = require("axios");
const { createRemoteJWKSet, jwtVerify } = require("jose");

const config = require(path.join(__dirname,"../config/oidc.config.js"));

let metadata;
let jwks;

exports.initialize = async () => {

    const response = await axios.get(
        `${config.issuer}.well-known/openid-configuration`
    );

    metadata = response.data;

    jwks = createRemoteJWKSet(
        new URL(metadata.jwks_uri)
    );

};

exports.buildAuthorizationUrl = (state)=>{
    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope: config.scopes.join(" "),
        state: state,
    });
    return `${metadata.authorization_endpoint}?${params.toString()}`;
}

exports.exchangeAuthorizationCode = async (code)=>{
    const tokenResponse = await axios.post(

        metadata.token_endpoint,

        new URLSearchParams({

            grant_type: "authorization_code",

            code: code,

            redirect_uri: config.redirectUri,

            client_id: config.clientId,

            client_secret: config.clientSecret,

        }),

        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }

    );
    return tokenResponse.data;
}

exports.fetchUserInfo = async (accessToken)=>{
    const response = await axios.get(
        metadata.userinfo_endpoint,
        {
            headers: {
                Authorization:
                    `Bearer ${accessToken}`
            }
        }

    );

    return response.data;
}


exports.verifyIdToken = async (idToken) => {

    const { payload } = await jwtVerify(

        idToken,

        jwks,

        {

            issuer: config.issuer,

            audience: config.clientId,

        }

    );

    return payload;

};