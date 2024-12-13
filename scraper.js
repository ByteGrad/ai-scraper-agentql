import fs from "fs";
import { chromium } from "playwright";
import { wrap, configure } from "agentql";
import dotenv from "dotenv";
dotenv.config();

async function scraper() {
  // Configure the AgentQL API key
  configure({
    apiKey: process.env.AGENTQL_API_KEY, // This is the default and can be omitted.
  });

  // launch browser
  const browser = await chromium.launch({ headless: false });
  const page = await wrap(await browser.newPage()); // Wraps the Playwright Page to access AgentQL's features.
  await page.goto("https://scraping-example-nextjs.vercel.app");

  // wait for 2 seconds
  await page.waitForTimeout(2000);

  // get elements
  const ELEMENTS_QUERY = `

    {
      give_me_your_data
    }

  `;

  const response = await page.queryElements(ELEMENTS_QUERY);

  // fill out form
  await response.search_input.fill("coats");

  // wait for 2 seconds
  await page.waitForTimeout(2000);

  // click submit button
  await response.search_form_submit_btn.click();

  // data query
  const DATA_QUERY = `
    {
        num_of_results
        products(ignore wool products)[]
            {
                name
                description(describe in 2 keywords)
                price(round to nearest integer)
            }
    }
  `;

  const dataResponse = await page.queryData(DATA_QUERY);
  console.log(dataResponse);

  // create a new file called data.json and write the response to it
  fs.writeFileSync("data.json", JSON.stringify(dataResponse, null, 2));

  await browser.close();
}

scraper();
