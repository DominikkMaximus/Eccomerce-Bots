const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())


const size= ["8","9","10.5"]
//numbers only

const profilesinfo = [{firstName:"mYNAME", lastName:"MySurname", email:"mygmail0@gmail.com",tel:"000000001"},
{firstName:"name", lastName:"surname", email:"mygmail1@gmail.com",tel:"000000002"},{
firstName:"my", lastName:"lastname", email:"mygmail2@gmail.com",tel:"000000003"}]

const shippinginfo = [{address:"example adress 1",city:"mycity",country:"198",postcode:"1000"},
{address:"example adress 2",city:"My city",country:"198",postcode:"1001"},
{address:"example street 3",city:"myCity",country:"198",postcode:"1002"}];

//at select elements, we look at the value

const paymentinfo = [{creditCardNumber:"5511223688654937",expMonth:"8",expYear:"2022",cvv:"000"},
{creditCardNumber:"5511223688654973",expMonth:"7",expYear:"2022",cvv:"111"},
{creditCardNumber:"5511223688659437",expMonth:"8",expYear:"2023",cvv:"001"}];
//expMonth value is without 0 in front (for example: 1 , NOT 01)
console.time();

const delay = 2000;
const paymentDelay = 100;
const itemUrl = "https://eu.kith.com/collections/mens-footwear/products/aafx5391";
const basketUrl = "https://eu.kith.com/pages/international-checkout#Global-e_International_Checkout"

for (let i=0; i < 2; i++){
    async function initBrowser() {
        const browser = await puppeteer.launch({ executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", args: ['--no-sandbox'], headless: false });
        const page = await browser.newPage(); 
        return page;
    }
    
    async function addToCart(page){
        await page.goto(itemUrl);
        //await page.waitForXPath("/html/body/div[4]//section/div/div[2]/div/div/div[2]");
        console.log("Page loaded correctly " +i);   
        //await page.$eval("button[aria-label='Deny all']", elem => elem.click());
        //console.log("Cookies denied " +i);
        await page.waitForXPath("/html/body/div[8]/div/button");        
        await page.$eval("button[class='btn btn--white welcome-mat__close']", elem => elem.click());
        await page.waitForTimeout(delay);
        await page.waitForXPath("/html/body/div[2]/main/div[2]/section/div[2]/form/button");         
        console.log("On product page " +i);
        await page.waitForTimeout(delay); 
        await page.select('#SingleOptionSelector-0', size[i]);
        await page.waitForTimeout(delay);
        await page.waitForXPath('/html/body/div[2]/main/div[2]/section/div[2]/form/button');
        await page.waitForTimeout(delay);
        await page.$eval("button[name='add']", elem => elem.click());
        await page.waitForTimeout(delay);
        console.log("Adding to cart " +i);
        await page.waitForXPath('/html/body/section[1]/div/form/div[2]/button[1]');
        await page.waitForTimeout(delay);
        await page.$eval("button[name='checkout']", elem => elem.click());
        console.timeLog();        
    }
    
    /*async function retyAddToCart(page){
        await page.goto(itemUrl);
        page.waitForTimeout(delay)
        await page.$eval("a[href='https://www.supremenewyork.com/checkout']", elem => elem.click());
        console.log("Product still in stock " +i)
        }*/

    async function shipping(page){
        console.log("Submitting shipping information "+i);
        await page.waitForXPath('/html/body');        
        await page.click('#CheckoutData_BillingFirstName');
        await page.type('#CheckoutData_BillingFirstName', profilesinfo[i].firstName);
        await page.click('#CheckoutData_BillingLastName');
        await page.type('#CheckoutData_BillingLastName', profilesinfo[i].lastName);
        await page.click('#CheckoutData_Email');
        await page.type('#CheckoutData_Email', profilesinfo[i].email);
        await page.click('#BillingCountryID')
        await page.select('#BillingCountryID', shippinginfo[i].country);
        await page.click('#CheckoutData_BillingAddress1');           
        await page.type('#CheckoutData_BillingAddress1', shippinginfo[i].address);
        await page.click('#BillingCity');   
        await page.type('#BillingCity', shippinginfo[i].city);
        await page.click('#BillingZIP')           
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
        await addToCart(page);
        await cartingError(page);
        //Check if redirect to checkout link was made correctly
        //(this could happen if product is OOS or if there is rate limit (basically, Shopify is blocking our bot))
        console.timeLog();  
    }

    checkout();
    
}
