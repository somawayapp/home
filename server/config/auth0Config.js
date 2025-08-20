import {auth} from 'express-oauth2-jwt-bearer'

const jwtCheck = auth({
    audience: "https://dev-o5a05odll5uw2ohu.au.auth0.com/api/v2/",
    issuerBaseURL: "https://dev-03ifqltxbr6nn0hn.us.auth0.com",
    tokenSigningAlg: "RS256"
})

export default jwtCheck  