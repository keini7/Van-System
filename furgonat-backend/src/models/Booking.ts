import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId; // Referencë për User (client)
  route: mongoose.Types.ObjectId; // Referencë për Route
  van: mongoose.Types.ObjectId; // Referencë për Van
  manager: mongoose.Types.ObjectId; // Referencë për User (manager)
  numberOfSeats: number; // Numri i vendeve të rezervuara
  totalPrice: number; // Çmimi total
  status: "pending" | "confirmed" | "cancelled" | "completed";
  passengerName?: string; // Emri i pasagjerit (opsional, mund të jetë i ndryshëm nga user)
  passengerPhone?: string; // Telefoni i pasagjerit
  notes?: string; // Shënime shtesë
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

// Indekse
BookingSchema.index({ user: 1 });
BookingSchema.index({ route: 1 });
BookingSchema.index({ van: 1 });
BookingSchema.index({ manager: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ created_at: -1 });

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);

