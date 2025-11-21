import mongoose, { Schema, Document } from "mongoose";

export interface ISchedule extends Document {
  van: mongoose.Types.ObjectId; // Referencë për Van
  manager: mongoose.Types.ObjectId; // Referencë për User (manager)
  destination: string; // Destinacioni (p.sh. "Tirana")
  departureTime: string; // Ora e nisjes (p.sh. "06:00")
  arrivalTime: string; // Ora e mbërritjes (p.sh. "09:00")
  price: number; // Çmimi për person
  daysOfWeek: number[]; // Ditët e javës (0=Sunday, 1=Monday, ..., 6=Saturday). Bosh = çdo ditë
  isActive: boolean; // Nëse orari është aktiv
  totalSeats?: number; // Numri i vendeve (opsional, default: kapaciteti i furgonit)
  created_at: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    van: { type: Schema.Types.ObjectId, ref: "Van", required: true },
    manager: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    price: { type: Number, required: true },
    daysOfWeek: { type: [Number], default: [] }, // Bosh = çdo ditë
    isActive: { type: Boolean, default: true },
    totalSeats: { type: Number },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indekse
ScheduleSchema.index({ van: 1 });
ScheduleSchema.index({ manager: 1 });
ScheduleSchema.index({ isActive: 1 });
ScheduleSchema.index({ destination: 1 });

export const Schedule = mongoose.model<ISchedule>("Schedule", ScheduleSchema);

