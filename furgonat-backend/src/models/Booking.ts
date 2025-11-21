import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  route: mongoose.Types.ObjectId;
  van: mongoose.Types.ObjectId;
  manager: mongoose.Types.ObjectId;
  numberOfSeats: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  passengerName?: string;
  passengerPhone?: string;
  notes?: string;
  created_at: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    route: { type: Schema.Types.ObjectId, ref: "Route", required: true },
    van: { type: Schema.Types.ObjectId, ref: "Van", required: true },
    manager: { type: Schema.Types.ObjectId, ref: "User", required: true },
    numberOfSeats: { type: Number, required: true, default: 1 },
    totalPrice: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },
    passengerName: { type: String },
    passengerPhone: { type: String },
    notes: { type: String },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ user: 1 });
BookingSchema.index({ route: 1 });
BookingSchema.index({ van: 1 });
BookingSchema.index({ manager: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ created_at: -1 });

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);

