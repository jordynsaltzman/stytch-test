const express = require("express");
const app = express();
const cors = require("cors");
const stytch = require("stytch");

app.use(cors());
app.use(express.json());

const client = new stytch.Client({
  project_id: "project-test-df95bc71-d719-400d-8284-70d6348783d9",
  secret: "secret-test-8iyfDY3uXOp-Bfg5s75_GGZ8AxBp5nyBCEs=",
  env: stytch.envs.test,
});

//will run before every api request and check to see if the token sent in the headers matches the one in stytch. If it doesnt match, it should prohibit the request from sending and return an error.
const authMiddleware = (req, res, next) => {
  //all variables in the header are lowercase
  const sessionToken = req.headers.sessiontoken;
  client.sessions
    .authenticate({ session_token: sessionToken })
    .then(() => {
      //only gets called when the user is authenticated, continues with the request
      next();
    })
    .catch((err) => {
      res.json(err);
    });
};

app.post("/login", (req, res) => {
  const email = req.body.email;
  const params = {
    email,
    //the url that we want the user to be redirected to after they click the magic link (frontend URLs)
    login_magic_link_url: "http://localhost:3000/auth",
    signup_magic_link_url: "http://localhost:3000/auth",
  };
  //using the magic links service from stytch where we get a token from the user who is trying to login or signup
  //when you receive an email from stytch, it will either login or create a new user if the user is not in the dc of users
  client.magicLinks.email
    .loginOrCreate(params)
    .then((resp) => res.json(resp))
    .catch((err) => console.log("LOGIN ERROR!!!", err));
});

// app.get("/auth", (req, res) => {
//   const token = req.body.token;
//   console.log("REQ.body.TOKEN", token);
//   //authenticate the one time token in stytch, and then we get back the session token
//   client.magicLinks
//     .authenticate(token, {
//       session_duration_minutes: 30,
//     })
//     .then((resp) => {
//       if (resp.ok) {
//         res.json(`(backend) Authenticated user with stytchUserId: ${resp}`);
//       } else {
//         res.status(resp.status_code).send("Could not authenticate the user (backend).");
//       }
//     })
//     .catch((err) => res.status(500).send(`Error authenticating user (backend) ${err}`));
// });

app.post("/auth", async (req, res) => {
    try {
      const token = req.body.token;
      console.log("TOKEN!!!", token);
      const sessionToken = await client.magicLinks.authenticate(token, {
        session_duration_minutes: 30,
      });
      res.send(sessionToken);
    } catch (err) {
      res.json(err);
    }
  });

app.post("/test", authMiddleware, (req, res) => {
  res.json("IT WORKED. THIS USER IS AUTHENTICATED");
});

app.listen(3001, () => {
  console.log("SERVER is running");
});
