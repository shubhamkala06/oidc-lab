const path = require("path");
const crypto = require("crypto");

const oidcService = require(path.join(__dirname,"../services/oidc.service.js"))

exports.login = (req,res)=>{
    const state = crypto.randomUUID();
    req.session.oauthState = state;
    const url = oidcService.buildAuthorizationUrl(state);
    res.redirect(url);
}


exports.callback = async (req, res) => {

    const { code, state } = req.query;
    if (state !== req.session.oauthState) {
        return res.status(400).send("Invalid state.");
    }
    delete req.session.oauthState;
    
    try{
        const tokens = await oidcService.exchangeAuthorizationCode(code);
        
        const identity = await oidcService.verifyIdToken(tokens.id_token);

        const profile  = await oidcService.fetchUserInfo(tokens.access_token);
        req.session.user = {
            subject:identity.sub,
            email:profile.email,
            name:profile.name,
        };
        console.log(req.session.user);
        res.redirect("/")
    }catch (err) {
        
        console.error(err.response?.data || err.message);
        
        return res.status(500).send("Token exchange failed.");
        
    }

};