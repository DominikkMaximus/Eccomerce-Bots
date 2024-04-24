const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const profilesinfo = [
{ email:"mygmail1@gmail.com",password:"000000002"},
{email:"mygmail2@gmail.com",password:"000000003"}]

console.time();

const minDelay = 500;
const maxDelay = 1500;
const homeUrl = "https://www.nike.com/si/"
const itemUrl = "https://www.nike.com/si/t/lebron-18-low-sylvester-vs-tweety-basketball-shoes-z0ssxD/CV7562-103";
const basketUrl = "https://www.nike.com/si/cart"
const checkoutUrl = "https://www.nike.com/si/checkout"

for (let i=0; i < 1; i++){

    function calculateNewDelay(){
        let delay = Math.round(minDelay + (maxDelay-minDelay)*Math.random());
        console.log("Delay for " +i + " is " + delay + " ms");
        return delay;
    }

    async function initBrowser() {
        const browser = await puppeteer.launch({ executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        args: ['--no-sandbox'],
        headless: false,
        slowMo: 50
        // wait 50ms after each step
        });
        const page = await browser.newPage();
        return page;
    }
    
    async function login(page){
        await page.goto(homeUrl);
        let delay = calculateNewDelay();
        await page.waitForXPath('/html/body/div[1]/div[3]/div[1]/div/div/div[3]/div/button');
        console.log("Home page loaded correctly " +i);    
        await page.click("button[data-var='loginBtn']");
        await page.waitForTimeout(delay);
        await page.waitForXPath("/html/body/div[1]/div[1]/div/div[1]/div/div[6]/form/div[2]/input");         
        console.log("Logging in " +i);
        await page.waitForTimeout(delay); 
        await page.type("input[placeholder='Email address']", profilesinfo[i].email);
        await page.waitForTimeout(delay);
        await page.type("input[placeholder='Password']", profilesinfo[i].password);
        await page.waitForTimeout(delay);
        await page.click("input[name='keepMeLoggedIn']");
        await page.waitForTimeout(delay/2);
        await page.click("input[value='SIGN IN']");
        await page.waitForTimeout(2*delay);
        console.log("Login complete " +i);
        console.timeLog();        
    }

    async function addToCart(page){
        await page.goto(itemUrl);
        let delay = calculateNewDelay();
        await page.waitForXPath('/html/body/div[1]/div[2]');
        console.log("Product page loaded correctly " +i);    
        console.log("Select size " + i);
        await page.waitForTimeout(delay);
        await page.waitForTimeout(delay);
        await page.click("button[aria-label='Add to Bag']");         
        console.log("Adding to cart " +i);
        await page.waitForTimeout(delay); 
        await page.waitForTimeout(delay);
        await page.goto(basketUrl);
        await page.waitForTimeout(delay);
        await page.goto(checkoutUrl);
        await page.waitForTimeout(delay);
        console.timeLog();
        console.log("NEED ATTENTION TO COMPLETE CHECKOUT!!!" +i);        
    }

    async function checkout(){
        const page = await initBrowser(); 
        await page.setDefaultNavigationTimeout(10000000);
        await login(page);
        await addToCart(page);
        //Check if redirect to checkout link was made correctly
        //(this could happen if product is OOS or if there is rate limit (basically, Shopify is blocking our bot))
        console.timeLog();  
    }

    checkout();
}
