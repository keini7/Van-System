import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  birthdate?: Date;
  password: string;
  role: "client" | "manager";
  plate_number?: string;
  created_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    gender: { type: String },
    birthdate: { type: Date },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["client", "manager"] },
    plate_number: { type: String },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Create indexes
// Note: email index is already created by unique: true, so we don't need to add it again
UserSchema.index({ role: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
