import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import leadsRouter from "./leads.js";
import customersRouter from "./customers.js";
import jobsRouter from "./jobs.js";
import invoicesRouter from "./invoices.js";
import reviewsRouter from "./reviews.js";
import smsRouter from "./sms.js";
import referralsRouter from "./referrals.js";
import demoRouter from "./demo.js";
import analyticsRouter from "./analytics.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/leads", leadsRouter);
router.use("/customers", customersRouter);
router.use("/jobs", jobsRouter);
router.use("/invoices", invoicesRouter);
router.use("/reviews", reviewsRouter);
router.use("/sms", smsRouter);
router.use("/referrals", referralsRouter);
router.use("/referral-groups", referralsRouter);
router.use("/demo", demoRouter);
router.use("/analytics", analyticsRouter);

export default router;
