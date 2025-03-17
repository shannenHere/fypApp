import puppeteer from "puppeteer";

async function getPrivacyPolicyText(url) {
    try {
        console.log(`Opening privacy policy page: ${url}`);

        const browser = await puppeteer.launch({ 
            headless: "new", 
            args: ["--ignore-certificate-errors", "--disable-infobars"]}); // Change to true for background mode
        const page = await browser.newPage();

        // Block unnecessary resources (images, fonts, styles) to speed up loading
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            if (["image", "stylesheet", "font", "media"].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Navigate to the page
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        console.log("Page loaded.");

        // Close pop-ups if detected
        try {
            await page.evaluate(() => {
                let btns = [...document.querySelectorAll("button")];
                let cookieBtn = btns.find(b => /accept|agree|ok/i.test(b.innerText));
                if (cookieBtn) cookieBtn.click();
            });
            console.log("Closed pop-ups.");
        } catch (popupError) {
            console.log("No pop-ups to close.");
        }

        // Try extracting text normally
        let privacyText = await page.evaluate(() => document.body.innerText.trim());

        // If blank, try Ctrl+A + Ctrl+C method
        if (!privacyText || privacyText.replace(/\s/g, "").length < 50) {
            console.log("Privacy policy text is empty. Trying backup method...");
            
            // Simulate "Ctrl+A" to select all text
            await page.keyboard.down("Control");
            await page.keyboard.press("A");
            await page.keyboard.up("Control");

            // Simulate "Ctrl+C" to copy
            await page.keyboard.down("Control");
            await page.keyboard.press("C");
            await page.keyboard.up("Control");

            // Wait for clipboard API to access copied text
            await page.waitForTimeout(1000);

            // Retrieve copied text
            privacyText = await page.evaluate(() => navigator.clipboard.readText());
        }

        await browser.close();

        if (!privacyText || privacyText.replace(/\s/g, "").length < 50) {
            console.log("Privacy policy not found on page.");
            return "No policy found.";
        }

        console.log("Extracted Privacy Policy Text:\n", privacyText.slice(0, 500)); // Show first 500 characters
        return privacyText;

    } catch (error) {
        console.error("Error fetching privacy policy:", error);
        return "Error retrieving policy.";
    }
}

/*
// Accept URL from command line arguments
const url = process.argv[2];

if (!url) {
    console.log("Usage: node script.js <URL>");
    process.exit(1);
}

// Run the scraper
getPrivacyPolicyText(url).then((text) => {
    console.log("\nFull Privacy Policy Extracted:\n", text);
});
*/

export { getPrivacyPolicyText };
