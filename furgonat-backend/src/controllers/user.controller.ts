import { Request, Response } from "express";
import { Route } from "../models/Route";
import { Booking } from "../models/Booking";
import { Van } from "../models/Van";
import { Schedule } from "../models/Schedule";

// Get user dashboard data
export const getUserDashboard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { User } = await import("../models/User");

    // Get full user data
    const userData = await User.findById(user.id).select("-password");
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's bookings
    const bookings = await Booking.find({ user: user.id })
      .populate("route", "origin destination departureTime arrivalTime date price")
      .populate("van", "plateNumber vanModel photo")
      .populate("manager", "firstName lastName email")
      .sort({ created_at: -1 })
      .limit(10);

    // Get active bookings count
    const activeBookingsCount = await Booking.countDocuments({
      user: user.id,
      status: { $in: ["pending", "confirmed"] },
    });

    res.json({
      message: "Welcome to User Dashboard 🚗",
      user: {
        id: userData._id.toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      },
      stats: {
        totalBookings: bookings.length,
        activeBookings: activeBookingsCount,
      },
      recentBookings: bookings,
    });
  } catch (error: any) {
    console.error("Error fetching user dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

// Get available routes (destinacione)
export const getAvailableRoutes = async (req: Request, res: Response) => {
  try {
    const { origin, destination, date } = req.query;

    // Build query for existing routes
    const query: any = {
      status: "scheduled",
      availableSeats: { $gt: 0 }, // Vetëm rrugët me vende të lira
    };

    if (origin) {
      query.origin = { $regex: new RegExp(origin as string, "i") };
    }

    if (destination) {
      query.destination = { $regex: new RegExp(destination as string, "i") };
    }

    // Determine date range - only future dates
    let startDate: Date;
    let endDate: Date;
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    if (date) {
      const requestedDate = new Date(date as string);
      requestedDate.setHours(0, 0, 0, 0);
      
      // Only show routes for today or future dates
      if (requestedDate < today) {
        // If requested date is in the past, show only today's routes
        startDate = new Date(today);
      } else {
        startDate = new Date(requestedDate);
      }
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
    } else {
      // Nëse nuk ka date, shfaq vetëm rrugët e ardhshme (7 ditët e ardhshme)
      startDate = new Date(today);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
    }

    query.date = { $gte: startDate, $lt: endDate };

    // Get existing routes
    let existingRoutes = await Route.find(query)
      .populate("van", "plateNumber vanModel capacity photo")
      .populate("manager", "firstName lastName phone")
      .sort({ date: 1, departureTime: 1 });

    // Filter out routes that have passed (date + time) or have no available seats
    const filteredExistingRoutes: any[] = [];
    for (const route of existingRoutes) {
      // Exclude routes with no available seats
      if (typeof route.availableSeats === "number" && route.availableSeats <= 0) {
        continue;
      }

      // Ensure route.date is a valid date
      const routeDate = new Date(route.date);
      // Ensure route.departureTime is a string like "HH:mm"
      let departureTimeStr = "00:00";
      if (typeof route.departureTime === "string") {
        departureTimeStr = route.departureTime;
      }

      const [depHour = 0, depMin = 0] = departureTimeStr.split(":").map(Number);

      // Combine date + time for the route's scheduled departure
      const routeDateTime = new Date(routeDate);
      routeDateTime.setHours(depHour, depMin, 0, 0);

      // If route datetime is before "now", exclude it
      if (routeDateTime < now) continue;

      filteredExistingRoutes.push(route);
    }
    existingRoutes = filteredExistingRoutes;

    // Get active schedules and create routes for upcoming dates
    const activeSchedules = await Schedule.find({ isActive: true })
      .populate("van", "plateNumber vanModel capacity photo")
      .populate("manager", "firstName lastName phone");

    const generatedRoutes: any[] = [];
    
    for (const schedule of activeSchedules) {
      // Generate routes for each day in the date range
      const currentDate = new Date(startDate);
      
      while (currentDate < endDate) {
        const dayOfWeek = currentDate.getDay();
        
        // Check if schedule is active for this day
        if (!schedule.daysOfWeek || schedule.daysOfWeek.length === 0 || schedule.daysOfWeek.includes(dayOfWeek)) {
          // Check if this date/time has already passed
          const routeDate = new Date(currentDate);
          routeDate.setHours(0, 0, 0, 0);
          const today = new Date(now);
          today.setHours(0, 0, 0, 0);

          // Skip if date is in the past
          if (routeDate < today) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
          }

          // If date is today, check if departure time has passed
          if (routeDate.getTime() === today.getTime()) {
            const [hours, minutes] = schedule.departureTime.split(':').map(Number);
            const departureDateTime = new Date(routeDate);
            departureDateTime.setHours(hours, minutes, 0, 0);
            
            // Skip if departure time has passed
            if (departureDateTime < now) {
              currentDate.setDate(currentDate.getDate() + 1);
              continue;
            }
          }

          // Check if route already exists
          const existingRoute = await Route.findOne({
            van: schedule.van,
            date: currentDate,
            departureTime: schedule.departureTime,
            destination: schedule.destination,
          });

          if (!existingRoute) {
            // Create route from schedule
            const route = new Route({
              origin: "Pogradec",
              destination: schedule.destination,
              departureTime: schedule.departureTime,
              arrivalTime: schedule.arrivalTime,
              price: schedule.price,
              van: schedule.van,
              manager: schedule.manager,
              availableSeats: schedule.totalSeats || (schedule.van as any).capacity,
              totalSeats: schedule.totalSeats || (schedule.van as any).capacity,
              date: new Date(currentDate),
              status: "scheduled",
            });

            await route.save();
            await route.populate("van", "plateNumber vanModel capacity photo");
            await route.populate("manager", "firstName lastName phone");
            
            // Check if it matches the query filters and has available seats
            if ((!origin || route.origin.toLowerCase().includes((origin as string).toLowerCase())) &&
                (!destination || route.destination.toLowerCase().includes((destination as string).toLowerCase())) &&
                route.availableSeats > 0) {
              generatedRoutes.push(route);
            }
          } else {
            // If route exists, don't add it to generatedRoutes since it's already in existingRoutes
            // The existing route will be filtered later along with other existing routes
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Combine existing and generated routes
    let allRoutes = [...existingRoutes, ...generatedRoutes];
    
    // Remove duplicates based on _id (in case a route exists in both existingRoutes and generatedRoutes)
    const uniqueRoutesMap = new Map();
    allRoutes.forEach((route) => {
      const routeId = route._id?.toString() || route.id?.toString();
      if (routeId && !uniqueRoutesMap.has(routeId)) {
        uniqueRoutesMap.set(routeId, route);
      }
    });
    allRoutes = Array.from(uniqueRoutesMap.values());
    
    // Filter out routes that have passed (date + time) or have no available seats
    allRoutes = allRoutes.filter((route) => {
      // Check if route has available seats
      if (route.availableSeats <= 0) {
        return false;
      }

      // Check if route date has passed
      const routeDate = new Date(route.date);
      routeDate.setHours(0, 0, 0, 0);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      // If route date is in the past, exclude it
      if (routeDate < today) {
        return false;
      }

      // If route date is today, check if departure time has passed
      if (routeDate.getTime() === today.getTime()) {
        const [hours, minutes] = route.departureTime.split(':').map(Number);
        const departureDateTime = new Date(routeDate);
        departureDateTime.setHours(hours, minutes, 0, 0);
        
        // If departure time has passed, exclude it
        if (departureDateTime < now) {
          return false;
        }
      }

      return true;
    });
    
    // Sort and limit
    allRoutes.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.departureTime.localeCompare(b.departureTime);
    });

    res.json({
      routes: allRoutes.slice(0, 50),
      count: allRoutes.length,
    });
  } catch (error: any) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ error: "Failed to fetch routes" });
  }
};

// Get user's bookings
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status } = req.query;

    const query: any = { user: user.id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("route", "origin destination departureTime arrivalTime date price")
      .populate("van", "plateNumber vanModel photo")
      .populate("manager", "firstName lastName email phone")
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

// Create new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { routeId, numberOfSeats, passengerName, passengerPhone, notes } = req.body;

    // Validation
    if (!routeId || !numberOfSeats || numberOfSeats < 1) {
      return res.status(400).json({ error: "Route ID and number of seats are required" });
    }

    // Find route
    const route = await Route.findById(routeId).populate("van").populate("manager");
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }

    // Check if route has available seats
    if (route.availableSeats < numberOfSeats) {
      return res.status(400).json({ 
        error: `Only ${route.availableSeats} seats available` 
      });
    }

    // Check if route is scheduled
    if (route.status !== "scheduled") {
      return res.status(400).json({ error: "Route is not available for booking" });
    }

    // Calculate total price
    const totalPrice = route.price * numberOfSeats;

    // Get user data for passenger name
    const { User } = await import("../models/User");
    const userData = await User.findById(user.id);
    const fullName = userData 
      ? `${userData.firstName} ${userData.lastName}`
      : "Unknown";

    // Create booking
    const booking = new Booking({
      user: user.id,
      route: routeId,
      van: route.van,
      manager: route.manager,
      numberOfSeats,
      totalPrice,
      passengerName: passengerName || fullName,
      passengerPhone: passengerPhone || userData?.phone,
      notes,
      status: "confirmed",
    });

    await booking.save();

    // Update route available seats
    route.availableSeats -= numberOfSeats;
    await route.save();

    // Populate booking for response
    await booking.populate("route", "origin destination departureTime arrivalTime date price");
    await booking.populate("van", "plateNumber vanModel");
    await booking.populate("manager", "firstName lastName email phone");

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("route");
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled" || booking.status === "completed") {
      return res.status(400).json({ error: "Booking cannot be cancelled" });
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save();

    // Return seats to route
    const route = await Route.findById(booking.route);
    if (route) {
      route.availableSeats += booking.numberOfSeats;
      await route.save();
    }

    res.json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};
