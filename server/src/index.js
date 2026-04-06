import app from "./app.js";

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`REMT server listening on http://localhost:${port}`);
});
