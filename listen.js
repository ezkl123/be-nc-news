const app = require("./app");
const { PORT = 9082 } = process.env;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));