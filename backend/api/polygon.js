const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());

app.get("/api/polygon", async (req, res) => {
  const { mahalle, ada, parsel } = req.query;

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
    console.error(
      "Error details:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: "Error fetching data from CBS API",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Backend API is running`);
});
