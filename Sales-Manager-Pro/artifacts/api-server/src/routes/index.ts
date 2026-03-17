import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import customersRouter from "./customers";
import ordersRouter from "./orders";
import expensesRouter from "./expenses";
import reportsRouter from "./reports";
import settingsRouter from "./settings";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/customers", customersRouter);
router.use("/orders", ordersRouter);
router.use("/expenses", expensesRouter);
router.use("/reports", reportsRouter);
router.use("/settings", settingsRouter);
router.use("/users", usersRouter);

export default router;
