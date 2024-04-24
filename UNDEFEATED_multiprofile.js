const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const profilesinfo = [
{email:"mygmail1@gmail.com", password: "examplepassword1",tel:"000000002"},
{email:"mygmail2@gmail.com", password: "examplepassword2",tel:"000000003"}]

const shippinginfo = [
{address:"example adress 2",city:"My city",country:"198",postcode:"1001"},
{address:"example street 3",city:"myCity",country:"198",postcode:"1002"}];

//at select elements, we look at the value

const paymentinfo = [
{creditCardNumber:"5511223688654973",expMonth:"7",expYear:"2022",cvv:"111"},
{creditCardNumber:"5511223688659437",expMonth:"8",expYear:"2023",cvv:"001"}];

const sizes = ["9","8","6"]

console.time();

const delay = 500;
const paymentDelay = 100;
const loginUrl = "https://undefeated.com/account/login?return_url=%2Faccount";
const basketUrl = "https://undefeated.com/pages/international-checkout#Global-e_International_Checkout"

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
        await page.waitForXPath('/html/body/div[3]/main/div/div/div/div[2]/form/input[3]');
        await page.type("input[id='CustomerEmail']", profilesinfo[i].email);
        await page.type("input[id='CustomerPassword']", profilesinfo[i].password);
        await page.waitForTimeout(delay);
        await page.$eval("input[value='Sign In']", elem => elem.click());
        console.log("Logged in " +i);
    }

    async function addToCart(page){
        //await page.goto(itemUrl); <- going to paste url manually after login and on site activity          
        await page.waitForXPath("/html/body/div[3]/main/div/div/div[1]/div/div/div[1]/div/div/div/div[2]/div[3]/form/div[1]/div/div[2]/div/select");
        console.log("On product page " +i);         
        await page.select("select[data-name='Size']",sizes[i]);
        await page.waitForTimeout(delay);
        await page.waitForXPath("/html/body/div[3]/main/div/div/div[1]/div/div/div[1]/div/div/div/div[2]/div[3]/form/div[2]/button");
        await page.$eval("button[href='#CartDrawer_ATC']", elem => elem.click());      
        await page.waitForTimeout(delay); 
        await page.$eval("a[class='site-nav__link site-nav__link--icon cart-link load-cart  bold ']", elem => elem.click());      
        await page.waitForTimeout(delay);
        await page.waitForXPath("/html/body/div[2]/div/div/div/header/div/div[3]/div/div/div[1]/div/div/p[4]/label/input");
        await page.click('#checkout-terms');
        await page.click('#checkout-btn');

        console.timeLog();        
    }
    async function shipping(page){
        await page.waitForXPath("/html/body/div[2]/div[2]/form[1]/div[1]/div[1]/div/div[2]/div[6]/div/input");
        await page.waitForTimeout(paymentDelay);
        await page.type('#CheckoutData_BillingAddress1',shippinginfo[i].address);
        await page.type('#BillingCity', shippinginfo[i].city);
        await page.type('#BillingZIP', shippinginfo[i].postcode);
        await page.waitForTimeout(delay);
        await page.click('#CheckoutData_BillingPhone')
        await page.type('#CheckoutData_BillingPhone', profilesinfo[i].tel);
        console.log("Shipping information filled " +i);
    }

    async function payment(page){
        await page.waitForXPath('/html/body/form/div/div/div[1]/div/input');
        console.log("Submitting payment information "+i);
        await page.type('#cardNum', paymentinfo[i].creditCardNumber);
        await page.select('#cardExpiryMonth', paymentinfo[i].expMonth);
        await page.select('#cardExpiryYear', paymentinfo[i].expYear);
        await page.type('#cvdNumber', paymentinfo[i].cvv);
        await page.click('#btnPay');
        console.log("Waiting for captcha " + i);
    }

    async function cartingError(page){
        await page.waitForTimeout(5000);
        let url = await page.url();
        if (url == basketUrl){
            console.log("Redirected correctly " + i);
            await shipping(page);
            await payment(page);
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
        await page.setDefaultNavigationTimeout(10000000);
        await login(page);
        await addToCart(page);
        await cartingError(page);
        //Check if redirect to checkout link was made correctly
        //(this could happen if product is OOS or if there is rate limit (basically, Shopify is blocking our bot))
        console.timeLog();  
    }

    checkout();
    
}
