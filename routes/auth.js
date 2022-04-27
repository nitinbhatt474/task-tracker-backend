import { hash, genSalt, compare } from "bcrypt";

const Auth = (app, db) => {
  app.post("/auth/login", (req, res) => {
    if (req.body.email === undefined || req.body.password === undefined) {
      res.json({ loggedIn: false, reason: "Email or password missing" });
    }

    db.find("users", { _id: req.body.email })
      .then(async (r) => {
        try {
          if (r.length !== 1) {
            res.json({ loggedIn: false, reason: "User not found" });
            return;
          }

          const password = r[0].password;
          const validPassword = await compare(req.body.password, password);

          if (validPassword) res.json({ loggedIn: true });
          else res.json({ loggedIn: false, reason: "Invalid Password" });
        } catch (err) {
          console.log("Error inside login", err);
          res.json({ loggedIn: false, reason: "User not found", err });
        }
      })
      .catch((err) => {
        console.log("Error ", err);
        res.json({ loggedIn: false, reason: err });
      });
  });

  app.post("/auth/register", async (req, res) => {
    if (req.body.email === undefined || req.body.password === undefined) {
      res.json({ registered: false, reason: "Email or password missing" });
    }

    const salt = await genSalt(10);
    const password = await hash(req.body.password, salt);

    db.insert("users", { _id: req.body.email, password })
      .then((r) => res.json({ registered: true }))
      .catch((err) => res.json({ registered: false, reason: err }));
  });
};

export default Auth;
