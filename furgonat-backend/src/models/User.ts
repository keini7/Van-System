export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  birthdate?: Date;
  password: string;
  role: "client" | "manager";
  plate_number?: string;
}
