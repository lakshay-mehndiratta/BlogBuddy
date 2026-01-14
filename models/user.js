const { createHmac, randomBytes } = require("crypto");
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/images/defaultpfp.jpg",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  const user = this;

  // ensure middleware continues when password not modified
  if (!user.isModified("password")) return;

  // use hex encoding for the salt
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  // save salt and overwrite password with hashed value
  user.salt = salt;
  user.password = hashedPassword;
});

userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
    const user = await this.findOne({ email });
    if(!user) throw new Error("User not found!");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
        .update(password)
        .digest("hex");

    if(hashedPassword !== userProvidedHash) {
        throw new Error("Invalid email or password!");
    }

    const token = createTokenForUser(user);
    return token;
});

// create model with name and schema
const User = model("User", userSchema);

module.exports = User;
