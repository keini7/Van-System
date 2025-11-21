import mongoose, { Schema, Document } from "mongoose";

export interface IVan extends Document {
  plateNumber: string; // Targa e furgonit (unique)
  manager: mongoose.Types.ObjectId; // Referencë për User (manager)
  vanModel?: string; // Modeli i furgonit (opsional) - ndryshuar nga 'model' për të shmangur konfliktin
  capacity: number; // Kapaciteti (numri i vendeve)
  photo?: string; // URL ose base64 e fotos së furgonit
  status: "active" | "inactive" | "maintenance";
  created_at: Date;
}

const VanSchema = new Schema<IVan>(
  {
    plateNumber: { type: String, required: true, unique: true },
    manager: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vanModel: { type: String },
    capacity: { type: Number, required: true, default: 15 },
    photo: { type: String }, // URL ose base64 e fotos
    status: { 
      type: String, 
      enum: ["active", "inactive", "maintenance"],
      default: "active"
    },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indekse
VanSchema.index({ plateNumber: 1 });
VanSchema.index({ manager: 1 });
VanSchema.index({ status: 1 });

export const Van = mongoose.model<IVan>("Van", VanSchema);

