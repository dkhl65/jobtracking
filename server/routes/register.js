const express = require("express");
const router = express.Router();
const usersDB = require("../models/user");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  // check for duplicate usernames in the db
  const duplicate = await usersDB.findOne({ where: { username: user } });
  if (duplicate) {
    return res.sendStatus(409); //Conflict
  }
  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(pwd, 10);
    //store the new user
    await usersDB.create({ username: user, password: hashedPwd });
    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

router.post("/", handleNewUser);

module.exports = router;