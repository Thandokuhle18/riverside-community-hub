import "dotenv/config";
import express from "express";
import cors from "cors";
import profilesRouter from "./routes/profiles";
import resourcesRouter from "./routes/resources.js";
import bookingsRouter from "./routes/bookings.js";
import donationsRouter from "./routes/donations.js";
import campaignsRouter from "./routes/campaigns.js";
import notificationsRouter from "./routes/notifications.js";
import adminRouter from "./routes/admin.js"
const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/profiles", profilesRouter);
app.use("/api/resources", resourcesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/donations", donationsRouter);
app.use("/api/campaigns", campaignsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/admin", adminRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found." }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Riverside API listening on port ${port}`));