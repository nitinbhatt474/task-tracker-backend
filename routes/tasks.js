import { compare } from "bcrypt";
import DBConnection from "../dbConnection.js";
const validateRequest = async (req, db) => {
  if (req.email === undefined || req.password === undefined)
    return { valid: false, reason: "Credentials missing" };

  const r = await db.find("users", { _id: req.email });
  try {
    if (r.length !== 1) return { valid: false, reason: "User not found" };

    const password = r[0].password;
    const validPassword = await compare(req.password, password);

    return validPassword
      ? { valid: true }
      : { valid: false, reason: "Invalid Password" };
  } catch (err) {
    return { valid: false, reason: "Invalid Data Format" };
  }
};

/**
 *
 * @param {Express} app
 * @param {DBConnection} db
 */
const Tasks = (app, db) => {
  //method to validate all the requests the server receives.
  app.post("/tasks/*", async (req, res, next) => {
    const validity = await validateRequest(req.body, db);
    if (validity.valid) next();
    else res.json(validity);
  });

  app.post("/tasks/add-task", (req, res) => {
    const collection = req.body.email;
    delete req.body.email;
    delete req.body.password;

    db.insert(collection, req.body)
      .then((r) => res.json({ added: true }))
      .catch((err) => res.json({ added: false, reason: err }));
  });

  app.post("/tasks/update-task", (req, res) => {
    const collection = req.body.email;
    delete req.body.email;
    delete req.body.password;

    db.updateOne(collection, req.body)
      .then((r) => {
        if (r.modifiedCount > 0) res.json({ updated: true });
        else res.json({ updated: false, reason: "No such task found" });
      })
      .catch((err) => res.json({ updated: false, reason: err }));
  });

  app.post("/tasks/get-tasks", (req, res) => {
    const collection = req.body.email;
    db.find(collection, {})
      .then((r) => res.json(r))
      .catch((err) => res.json({ err: err }));
  });

  app.post("/tasks/delete-task", (req, res) => {
    const collection = req.body.email;
    if (req.body._id === undefined)
      res.json({
        deleted: false,
        reason: "Id of the task to be deleted is missing",
      });

    db.deleteOne(collection, req.body._id)
      .then((r) => {
        if (r.deletedCount > 0) res.json({ deleted: true, res: r });
        else res.json({ deleted: false, reason: "No such task found" });
      })
      .catch((err) => res.json({ deleted: false, reason: err }));
  });

  app.post("/tasks/find-task", (req, res) => {
    const collection = req.body.email;
    if (req.body._id === undefined) res.json([]);
    else {
      db.findOne(collection, req.body._id)
        .then((r) => res.json(r))
        .catch((err) => res.json(err));
    }
  });
};

export default Tasks;
