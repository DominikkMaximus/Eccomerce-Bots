const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const profilesinfo =[
{email:"mygmail2@gmail.com", password: "examplepassword2", paymentMethod:"Visa", cardNumber:"1235353241435", expDate:"12/23", holderName:"NAME SURNAME", verificationCode:"123"}]

const sizes = ["button[data-attr-value='42']","button[data-attr-value='40']","button[data-attr-value='44']"]

console.time();

const delay = 500;
const paymentDelay = 100;
const loginUrl = "https://www.solebox.com/en_SI/login";
const basketUrl = "https://www.solebox.com/en_SI/checkout?stage=shipping#shipping"

for (let i=0; i < 1; i++){
    async function initBrowser() {
        const browser = await puppeteer.launch({ executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", args: ['--no-sandbox'], headless: false });
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(10000000); 
        return page;
    }
    async function login(page){
        await page.goto(loginUrl)
        console.log("Logging in "+i);
        await page.waitForTimeout(delay);
        await page.waitForXPath('/html/body/div[2]/div[3]/div/div[2]/div/div[1]/form/div[2]/div[3]/div[1]/div/div[1]/input');
        await page.type("input[aria-label='Email']", profilesinfo[i].email);
        await page.type("input[aria-label='Password']", profilesinfo[i].password);
        await page.waitForTimeout(delay);
        await page.$eval("button[aria-label='Login']", elem => elem.click());
        console.log("Logged in " +i);
    }

    async function addToCart(page){
        //await page.goto(itemUrl); <- going to paste url manually after login and on site activity          
        await page.waitForXPath("/html/body/div[2]/div[3]/div[2]/div[3]/div[2]/div/div[3]/div[1]/div[1]");
        console.log("On product page " +i);         
        await page.$eval(sizes[i], elem => elem.click());
        await page.waitForTimeout(delay);
        await page.$eval("button[class='f-pdp-button f-pdp-button--active js-btn-add-to-cart']", elem => elem.click());      
        await page.waitForTimeout(delay); 
        await page.$eval("a[href='/on/demandware.store/Sites-solebox-Site/en_SI/Checkout-Login']", elem => elem.click());      
        await page.waitForTimeout(delay);
        console.timeLog();        
    }
    async function finishCheckout(page){
        await page.click("button[aria-label='Save & continue']");
        await page.waitForXPath("/html/body/div[3]/div[2]/div/div/div[2]/div[3]/div[2]/div/button");
        await page.waitForTimeout(paymentDelay);
        await page.click("button[aria-label='Confirm & pay with']");
        console.log("Selecting payment method "+i);
        if (profilesinfo[i].paymentMethod == "Visa"){ 
            //for payment wih visa
            await page.waitForXPath("/html/body/div[2]/div[2]/div/main/section/ul/li[2]/form/button");
            await page.waitForTimeout(paymentDelay);
            await page.click("button[class='btn btn-select btn-card-visa']");
        }else{
            //for payment with mastercard
            await page.waitForXPath("/html/body/div[2]/div[2]/div/main/section/ul/li[2]/form/button");
            await page.click("button[class='btn btn-select btn-card-mastercard']");
        }
        await page.waitForXPath("/html/body/div[2]/div[2]/form/main/fieldset/div/div[1]/div[2]/sfp-card-number/input");
        await page.type("input[name='CardNumber']", profilesinfo[i].cardNumber);
        await page.type("input[name='Expiry']", profilesinfo[i].expDate);
        await page.waitForTimeout(paymentDelay);
        await page.type("input[name='HolderName']", profilesinfo[i].holderName);
        await page.type("input[name='VerificationCode']", profilesinfo[i].verificationCode);
        await page.waitForTimeout(paymentDelay);
        await page.click("button[name='SubmitToNext']");
        console.log("Payment submited "+i);
    }

    async function cartingError(page){
        await page.waitForTimeout(5000);
        let url = await page.url();
        if (url == basketUrl){
            console.log("Redirected correctly " + i);
            await finishCheckout(page);
            //Continues checkout process
        }else{
            console.log(url+ " " + i);
            console.log("Rety add to cart (rate limited?) " + i);
            await page.waitForTimeout(5000);
            await cartingError(page);
        }
    }

    async function checkout(){
        const page = await initBrowser(); 
        await page.setDefaultTimeout(10000000);
        await login(page);
        await addToCart(page);
        await cartingError(page);
        //Check if redirect to checkout link was made correctly
        //(this could happen if product is OOS or if there is rate limit (basically, Shopify is blocking our bot))
        console.timeLog();  
    }

    checkout();
    
}
