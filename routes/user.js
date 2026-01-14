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
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

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
  try {
    const { fullName, email, password } = req.body;

    let profileImageURL = "/images/defaultpfp.jpg";
    if (req.file && req.file.filename) {
      profileImageURL = `/uploads/${req.file.filename}`;
    }

    await User.create({
      fullName,
      email,
      password,
      profileImageURL,
    });

    return res.redirect("/");
  } catch (error) {
    // HANDLE DUPLICATE EMAIL
    if (error.code === 11000) {
      return res.render("signup", {
        error: "Email already registered. Please login instead.",
      });
    }

    console.error(error);
    return res.status(500).render("signup", {
      error: "Something went wrong. Please try again.",
    });
  }
});


router.get("/logout", (req, res) => {
    res.clearCookie("token").redirect("/");
});

module.exports = router;