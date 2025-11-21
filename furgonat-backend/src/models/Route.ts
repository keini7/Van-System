import mongoose, { Schema, Document } from "mongoose";

export interface IRoute extends Document {
  origin: string; // Nga ku (p.sh. "Tirana", "Durrës")
  destination: string; // Ku (p.sh. "Shkodër", "Vlorë")
  departureTime: string; // Ora e nisjes (p.sh. "08:00", "14:30")
  arrivalTime: string; // Ora e mbërritjes
  price: number; // Çmimi për person
  van: mongoose.Types.ObjectId; // Referencë për Van
  manager: mongoose.Types.ObjectId; // Referencë për User (manager)
  availableSeats: number; // Vende të lira
  totalSeats: number; // Total vende
  date: Date; // Data e udhëtimit
  status: "scheduled" | "completed" | "cancelled";
  created_at: Date;
}

const RouteSchema = new Schema<IRoute>(
  {
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    price: { type: Number, required: true },
    van: { type: Schema.Types.ObjectId, ref: "Van", required: true },
    manager: { type: Schema.Types.ObjectId, ref: "User", required: true },
    availableSeats: { type: Number, required: true, default: 0 },
    totalSeats: { type: Number, required: true, default: 0 },
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

