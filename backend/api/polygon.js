const express = require("express");
const axios = require("axios");
const app = express();
const port = 5000;
const cors = require("cors");
app.use(cors());

app.get("/api/polygon", async (req, res) => {
  const { mahalle, ada, parsel } = req.query;
  console.log("Request is done:", mahalle, ada, parsel);

  if (!mahalle || !ada || !parsel) {
    return res
      .status(400)
      .json({ error: "Missing required parameters: mahalle, ada, or parsel" });
  }

  const url = `https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api/parsel/${mahalle}/${ada}/${parsel}`;

  try {
    const response = await axios.get(url);

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching data from CBS API",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Backend API is running on http://localhost:${port}`);
});
