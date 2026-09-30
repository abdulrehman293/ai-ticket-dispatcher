require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/sort-message', async (req, res) => {
  const { message } = req.body;
  
  try {
    const response = await fetch("https://openrouter.ai/api/alpha/decisions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "typesafe/jev-1.13",
        state: `User message: "${message}"`,
        questions: {
          category: {
            type: "choice",
            instructions: "Which department should handle this ticket?",
            criteria: {
               "Tech Support": "Technical issues, server crashes, login problems.",
               "Billing": "Invoices, payments, refunds, credit cards.",
               "Sales": "Pricing, enterprise plans, volume discounts.",
               "Spam": "Crypto, scams, unsolicited promotions."
            }
          }
        }
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
        console.error("OpenRouter API Error:", data.error);
        return res.status(500).json({ error: 'OpenRouter API Error' });
    }

    const answer = data.answers.category;
    const result = {
      category: answer.choice,
      confidence: Math.round(answer.confidence * 100)
    };
    
    res.json(result);
  } catch (error) {
    console.error("Backend Crash Error:", error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Explicitly define the absolute path to the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});