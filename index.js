const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3001;


app.use(cors());
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/auth", require("./routes/auth.js"));
app.use("/students", require("./routes/server.js"));
app.all("*", (_, res) => {
    return res.json({ error: "not found" });
  });