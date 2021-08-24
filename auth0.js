import fetch from "node-fetch";
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-c17gyuzh.jp.auth0.com/.well-known/jwks.json`,
  }),
  audience: "https://react-with-heroku-2021-08-23.herokuapp.com",
  issuer: `https://dev-c17gyuzh.jp.auth0.com/`,
  algorithms: ["RS256"],
});

export async function getUser(token) {
  const auth0Request = await fetch(
    "https://dev-c17gyuzh.jp.auth0.com/userinfo",
    {
      headers: {
        Authorization: token,
      },
    }
  );
  return auth0Request.json();
}
