import { Request, Response } from "express";
import { Van } from "../models/Van";
import { Route } from "../models/Route";
import { Booking } from "../models/Booking";
import { Schedule } from "../models/Schedule";
import { User } from "../models/User";

// Get manager dashboard data
export const getManagerDashboard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { User } = await import("../models/User");

    // Get full user data
    const userData = await User.findById(user.id).select("-password");
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get manager's vans
    const vans = await Van.find({ manager: user.id });
    
    // Get manager's routes
    const routes = await Route.find({ manager: user.id })
      .populate("van", "plateNumber vanModel photo")
      .sort({ date: 1, departureTime: 1 })
      .limit(10);

    // Get bookings for manager's routes
    const bookings = await Booking.find({ manager: user.id })
      .populate("user", "firstName lastName email phone")
      .populate("route", "origin destination departureTime arrivalTime date price")
      .populate("van", "plateNumber vanModel photo")
      .sort({ created_at: -1 })
      .limit(10);

    // Stats
    const totalBookings = await Booking.countDocuments({ manager: user.id });
    const activeBookings = await Booking.countDocuments({
      manager: user.id,
      status: { $in: ["pending", "confirmed"] },
    });
    const totalRoutes = await Route.countDocuments({ manager: user.id });

    res.json({
      message: "Welcome to Van Manager Dashboard 🚐",
      user: {
        id: userData._id.toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        plateNumber: userData.plate_number,
      },
      stats: {
        totalVans: vans.length,
        totalRoutes,
        totalBookings,
        activeBookings,
      },
      vans,
      recentRoutes: routes,
      recentBookings: bookings,
    });
  } catch (error: any) {
    console.error("Error fetching manager dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

// Get manager's vans
export const getManagerVans = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const vans = await Van.find({ manager: user.id }).sort({ created_at: -1 });

    res.json({
      vans,
      count: vans.length,
    });
  } catch (error: any) {
    console.error("Error fetching vans:", error);
    res.status(500).json({ error: "Failed to fetch vans" });
  }
};

// Create new van
export const createVan = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { plateNumber, model, vanModel, capacity, photo } = req.body;

    console.log("🚐 Creating van request:", {
      plateNumber,
      hasPhoto: !!photo,
      photoLength: photo ? photo.length : 0,
      photoPreview: photo ? photo.substring(0, 50) + "..." : null,
    });

    // Validation
    if (!plateNumber) {
      return res.status(400).json({ error: "Plate number is required" });
    }

    // Check if plate number already exists
    const existingVan = await Van.findOne({ plateNumber: plateNumber.toUpperCase() });
    if (existingVan) {
      return res.status(400).json({ error: "Plate number already exists" });
    }

    // Create van
    const van = new Van({
      plateNumber: plateNumber.toUpperCase(),
      manager: user.id,
      vanModel: vanModel || model || undefined, // Support both for backward compatibility
      capacity: capacity || 15,
      photo: photo || undefined, // Foto e furgonit (base64 ose URL)
      status: "active",
    });

    await van.save();

    res.status(201).json({
      message: "Van created successfully",
      van,
    });
  } catch (error: any) {
    console.error("Error creating van:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Plate number already exists" });
    }
    res.status(500).json({ error: "Failed to create van" });
  }
};

// Get manager's routes
export const getManagerRoutes = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { vanId, date } = req.query;

    const query: any = { manager: user.id };

    if (vanId) {
      query.van = vanId;
    }

    if (date) {
      const searchDate = new Date(date as string);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: searchDate, $lt: nextDay };
    }

    const routes = await Route.find(query)
      .populate("van", "plateNumber vanModel capacity photo")
      .sort({ date: 1, departureTime: 1 });

    res.json({
      routes,
      count: routes.length,
    });
  } catch (error: any) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ error: "Failed to fetch routes" });
  }
};

// Create new route
export const createRoute = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { vanId, destination, departureTime, arrivalTime, price, date, totalSeats } = req.body;

    // Validation
    if (!vanId || !destination || !departureTime || !arrivalTime || !price || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if van belongs to manager
    const van = await Van.findOne({ _id: vanId, manager: user.id });
    if (!van) {
      return res.status(404).json({ error: "Van not found or not owned by you" });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(departureTime) || !timeRegex.test(arrivalTime)) {
      return res.status(400).json({ error: "Invalid time format. Use HH:MM" });
    }

    // Validate date
    const routeDate = new Date(date);
    if (isNaN(routeDate.getTime())) {
      return res.status(400).json({ error: "Invalid date" });
    }

    // Validate time range (5:00 - 18:00)
    const [depHour, depMin] = departureTime.split(":").map(Number);
    const [arrHour, arrMin] = arrivalTime.split(":").map(Number);
    const depMinutes = depHour * 60 + depMin;
    const arrMinutes = arrHour * 60 + arrMin;

    if (depMinutes < 5 * 60 || depMinutes >= 18 * 60) {
      return res.status(400).json({ error: "Departure time must be between 05:00 and 18:00" });
    }

    if (arrMinutes <= depMinutes) {
      return res.status(400).json({ error: "Arrival time must be after departure time" });
    }

    // Create route
    const route = new Route({
      origin: "Pogradec", // Fiksuar nga Pogradec
      destination: destination,
      departureTime,
      arrivalTime,
      price: Number(price),
      van: vanId,
      manager: user.id,
      availableSeats: totalSeats || van.capacity,
      totalSeats: totalSeats || van.capacity,
      date: routeDate,
      status: "scheduled",
    });

    await route.save();
    await route.populate("van", "plateNumber vanModel capacity");

    res.status(201).json({
      message: "Route created successfully",
      route,
    });
  } catch (error: any) {
    console.error("Error creating route:", error);
    res.status(500).json({ error: "Failed to create route" });
  }
};

// Get manager's bookings
export const getManagerBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { routeId, vanId, status } = req.query;

    const query: any = { manager: user.id };

    if (routeId) {
      query.route = routeId;
    }

    if (vanId) {
      query.van = vanId;
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("user", "firstName lastName email phone")
      .populate("route", "origin destination departureTime arrivalTime date price")
      .populate("van", "plateNumber vanModel photo")
      .sort({ created_at: -1 });

    res.json({
      bookings,
      count: bookings.length,
    });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// Get manager's schedules
export const getManagerSchedules = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { vanId, isActive } = req.query;

    const query: any = { manager: user.id };

    if (vanId) {
      query.van = vanId;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const schedules = await Schedule.find(query)
      .populate("van", "plateNumber vanModel capacity photo")
      .sort({ destination: 1, departureTime: 1 });

    res.json({
      schedules,
      count: schedules.length,
    });
  } catch (error: any) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
};

// Create new schedule
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { vanId, destination, departureTime, arrivalTime, price, daysOfWeek, totalSeats } = req.body;

    // Validation
    if (!vanId || !destination || !departureTime || !arrivalTime || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if van belongs to manager
    const van = await Van.findOne({ _id: vanId, manager: user.id });
    if (!van) {
      return res.status(404).json({ error: "Van not found or not owned by you" });
    }

    // Validate time format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(departureTime) || !timeRegex.test(arrivalTime)) {
      return res.status(400).json({ error: "Invalid time format. Use HH:MM" });
    }

    // Validate time range (5:00 - 18:00)
    const [depHour, depMin] = departureTime.split(":").map(Number);
    const depMinutes = depHour * 60 + depMin;
    if (depMinutes < 5 * 60 || depMinutes >= 18 * 60) {
      return res.status(400).json({ error: "Departure time must be between 05:00 and 18:00" });
    }

    // Validate daysOfWeek (0-6)
    if (daysOfWeek && Array.isArray(daysOfWeek)) {
      const invalidDays = daysOfWeek.filter((day: number) => day < 0 || day > 6);
      if (invalidDays.length > 0) {
        return res.status(400).json({ error: "Invalid days of week. Use 0-6 (0=Sunday, 6=Saturday)" });
      }
    }

    // Create schedule
    const schedule = new Schedule({
      van: vanId,
      manager: user.id,
      destination,
      departureTime,
      arrivalTime,
      price: Number(price),
      daysOfWeek: daysOfWeek && daysOfWeek.length > 0 ? daysOfWeek : [], // Bosh = çdo ditë
      totalSeats: totalSeats ? Number(totalSeats) : van.capacity,
      isActive: true,
    });

    await schedule.save();
    await schedule.populate("van", "plateNumber vanModel capacity");

    res.status(201).json({
      message: "Schedule created successfully",
      schedule,
    });
  } catch (error: any) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ error: "Failed to create schedule" });
  }
};

// Update schedule
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { scheduleId } = req.params;
    const { vanId, destination, departureTime, arrivalTime, price, daysOfWeek, totalSeats } = req.body;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Check if schedule belongs to manager
    if (schedule.manager.toString() !== user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Validation
    if (!destination || !departureTime || !arrivalTime || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate time format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(departureTime) || !timeRegex.test(arrivalTime)) {
      return res.status(400).json({ error: "Invalid time format. Use HH:MM" });
    }

    // Validate time range (5:00 - 18:00)
    const [depHour, depMin] = departureTime.split(":").map(Number);
    const depMinutes = depHour * 60 + depMin;
    if (depMinutes < 5 * 60 || depMinutes >= 18 * 60) {
      return res.status(400).json({ error: "Departure time must be between 05:00 and 18:00" });
    }

    // Update schedule
    schedule.destination = destination;
    schedule.departureTime = departureTime;
    schedule.arrivalTime = arrivalTime;
    schedule.price = Number(price);
    schedule.daysOfWeek = daysOfWeek && daysOfWeek.length > 0 ? daysOfWeek : [];
    if (vanId) schedule.van = vanId;
    if (totalSeats) schedule.totalSeats = Number(totalSeats);

    await schedule.save();
    await schedule.populate("van", "plateNumber vanModel capacity");

    res.json({
      message: "Schedule updated successfully",
      schedule,
    });
  } catch (error: any) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ error: "Failed to update schedule" });
  }
};

// Toggle schedule active status
export const toggleSchedule = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { scheduleId } = req.params;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Check if schedule belongs to manager
    if (schedule.manager.toString() !== user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    schedule.isActive = !schedule.isActive;
    await schedule.save();
    await schedule.populate("van", "plateNumber vanModel capacity");

    res.json({
      message: `Schedule ${schedule.isActive ? "activated" : "deactivated"} successfully`,
      schedule,
    });
  } catch (error: any) {
    console.error("Error toggling schedule:", error);
    res.status(500).json({ error: "Failed to toggle schedule" });
  }
};

// Create route from schedule for a specific date
export const createRouteFromSchedule = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { scheduleId, date } = req.body;

    if (!scheduleId || !date) {
      return res.status(400).json({ error: "Schedule ID and date are required" });
    }

    const schedule = await Schedule.findById(scheduleId).populate("van");
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Check if schedule belongs to manager
    if (schedule.manager.toString() !== user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Check if schedule is active
    if (!schedule.isActive) {
      return res.status(400).json({ error: "Schedule is not active" });
    }

    // Check if date matches schedule days
    const routeDate = new Date(date);
    const dayOfWeek = routeDate.getDay();
    
    if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      if (!schedule.daysOfWeek.includes(dayOfWeek)) {
        return res.status(400).json({ 
          error: `Schedule is not active on ${getDayName(dayOfWeek)}` 
        });
      }
    }

    // Check if route already exists for this date
    const existingRoute = await Route.findOne({
      van: schedule.van,
      date: routeDate,
      departureTime: schedule.departureTime,
      destination: schedule.destination,
    });

    if (existingRoute) {
      return res.status(400).json({ error: "Route already exists for this date and time" });
    }

    // Create route from schedule
    const route = new Route({
      origin: "Pogradec",
      destination: schedule.destination,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      price: schedule.price,
      van: schedule.van,
      manager: user.id,
      availableSeats: schedule.totalSeats || (schedule.van as any).capacity,
      totalSeats: schedule.totalSeats || (schedule.van as any).capacity,
      date: routeDate,
      status: "scheduled",
    });

    await route.save();
    await route.populate("van", "plateNumber vanModel capacity");

    res.status(201).json({
      message: "Route created from schedule successfully",
      route,
    });
  } catch (error: any) {
    console.error("Error creating route from schedule:", error);
    res.status(500).json({ error: "Failed to create route from schedule" });
  }
};

// Helper function
function getDayName(dayIndex: number): string {
  const days = ["E Diel", "E Hënë", "E Martë", "E Mërkurë", "E Enjte", "E Premte", "E Shtunë"];
  return days[dayIndex] || "Unknown";
}
