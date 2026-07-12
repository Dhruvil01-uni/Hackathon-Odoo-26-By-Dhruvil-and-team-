import { Router } from "express";
import { authRouter } from "./auth.routes";
import { dashboardRouter } from "./dashboard.routes";
import { driverRouter } from "./driver.routes";
import { expenseRouter } from "./expense.routes";
import { fuelRouter } from "./fuel.routes";
import { maintenanceRouter } from "./maintenance.routes";
import { reportRouter } from "./report.routes";
import { tripRouter } from "./trip.routes";
import { vehicleRouter } from "./vehicle.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/vehicles", vehicleRouter);
apiRouter.use("/drivers", driverRouter);
apiRouter.use("/trips", tripRouter);
apiRouter.use("/maintenance", maintenanceRouter);
apiRouter.use("/fuel", fuelRouter);
apiRouter.use("/expenses", expenseRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/reports", reportRouter);
