import mongoose, { Schema, Document } from "mongoose";

export interface IRoute extends Document {
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  van: mongoose.Types.ObjectId;
  manager: mongoose.Types.ObjectId;
  availableSeats: number;
  totalSeats: number;
  price: number; // Çmimi për vend
  date: Date;
  status: "scheduled" | "completed" | "cancelled";
  created_at: Date;
}

const RouteSchema = new Schema<IRoute>(
  {
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    van: { type: Schema.Types.ObjectId, ref: "Van", required: true },
    manager: { type: Schema.Types.ObjectId, ref: "User", required: true },
    availableSeats: { type: Number, required: true, default: 0 },
    totalSeats: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    date: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled"
    },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indekse për kërkesa më të shpejta
RouteSchema.index({ origin: 1, destination: 1 });
RouteSchema.index({ date: 1 });
RouteSchema.index({ status: 1 });
RouteSchema.index({ manager: 1 });

export const Route = mongoose.model<IRoute>("Route", RouteSchema);

