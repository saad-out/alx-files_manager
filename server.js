import express from 'express';
import routes from './routes/index';

const app = express();
app.use(express.json({ limit: '200mb' }));

app.use('/', routes);

const port = process.argv.PORT || '5000';
app.listen(Number(port), () => console.log(`Server running on port ${port}`));
