const { Router } = require("express");
const User = require("../models/user");
const multer = require('multer');
const path = require('path');

const router = Router();

const fs = require("fs");

const uploadPath = path.resolve("./public/uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

router.get("/signin", (req, res) => {
    return res.render("signin");
});

router.get("/signup", (req, res) => {
    return res.render("signup");
});

router.post("/signin", async (req, res) => {
    const {email, password} = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);

        return res.cookie("token", token).redirect("/");
    } catch (error) {
        return res.render("signin", {
            error: "Invalid email or password!"
        });
    }
});

router.post("/signup", upload.single("profileImage"), async (req, res) => {
    const { fullName, email, password } = req.body;
    const profileImageURL = req.file
  ? `/uploads/${req.file.filename}`
  : "/images/defaultpfp.jpg";
    await User.create({
        fullName,
        email,
        password,
        profileImageURL,
    });
    return res.redirect("/");
});

router.get("/logout", (req, res) => {
    res.clearCookie("token").redirect("/");
});

module.exports = router;