import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },
    profile: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      phone: { type: String, trim: true },
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" },
      },
      avatar: { type: String, default: null },
    },
    sellerInfo: {
      businessName: { type: String, trim: true },
      businessType: {
        type: String,
        enum: ["Individual", "Small Business", "Enterprise"],
        default: "Individual",
      },
      gstNumber: { type: String, trim: true },
      bankDetails: {
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String,
      },
      isVerified: { type: Boolean, default: false },
    },
    customerInfo: {
      wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      loyaltyPoints: { type: Number, default: 0 },
      carbonFootprintSaved: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ "sellerInfo.isVerified": 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Reset login attempts on login update
userSchema.pre("save", function (next) {
  if (this.isModified("lastLogin")) {
    this.loginAttempts = 0;
    this.lockUntil = null;
  }
  next();
});

// Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incLoginAttempts = function () {
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000;

  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

userSchema.methods.getFullName = function () {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
};

userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    fullName: this.getFullName(),
    avatar: this.profile.avatar,
    isVerified:
      this.role === "seller" ? this.sellerInfo.isVerified : this.isEmailVerified,
    joinDate: this.createdAt,
    lastLogin: this.lastLogin,
    carbonFootprintSaved:
      this.role === "customer" ? this.customerInfo.carbonFootprintSaved : 0,
  };
};

// Statics
userSchema.statics.findByLogin = function (login) {
  return this.findOne({
    $or: [{ email: login.toLowerCase() }, { username: login }],
  });
};

userSchema.statics.getUsersByRole = function (role, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ role })
    .select("-password -resetPasswordToken -emailVerificationToken")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

userSchema.statics.getSellerStats = function () {
  return this.aggregate([
    { $match: { role: "seller" } },
    {
      $group: {
        _id: null,
        totalSellers: { $sum: 1 },
        verifiedSellers: { $sum: { $cond: ["$sellerInfo.isVerified", 1, 0] } },
        activeSellers: { $sum: { $cond: ["$isActive", 1, 0] } },
      },
    },
  ]);
};

// Virtual
userSchema.virtual("isAccountLocked").get(function () {
  return this.isLocked();
});

userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.emailVerificationToken;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;
