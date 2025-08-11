import express from 'express';
import invoiceRoutes from './routes/invoice.routes.js';
import projectRoutes from './routes/project.routes.js';
import timesheetRoutes from './routes/timesheet.routes.js';
import estimatesRoutes from './routes/estimates.routes.js';

const app = express();
app.use(express.json());

app.use('/api/invoices', invoiceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/estimates', estimatesRoutes);

export default app;