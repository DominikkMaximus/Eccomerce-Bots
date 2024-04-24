const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const profilesinfo = [{fullName:"mY NAME",email:"mygmail1@gmail.com",tel:"000000001"},
{fullName:"Name my",email:"mymail2@gmail.com",tel:"000000002"},
{fullName:"name Surname",email:"mygmail3@gmail.com",tel:"0038600000003"}];

const shippinginfo = [{address:"example adress 1",city:"mycity",country:"SI",postcode:"1000"},
{address:"example adress 2",city:"My city",country:"SI",postcode:"1001"},
{address:"example street 3",city:"myCity",country:"SI",postcode:"1002"}];

const paymentinfo = [{creditCardNumber:"5511223688654937",expMonth:"08",expYear:"2022",cvv:"000"},
{creditCardNumber:"5511223688654973",expMonth:"07",expYear:"2022",cvv:"111"},
{creditCardNumber:"5511223688659437",expMonth:"08",expYear:"2023",cvv:"001"}];
//exp month is two digit number (0 in front)

console.time();

const delay = 300;
const paymentDelay = 100;
const itemUrl = "https://www.supremenewyork.com/shop/tops-sweaters/xp9s4qu0w/rbaiep2ok";
const basketUrl = "https://www.supremenewyork.com/checkout"

for (let i=0; i < profilesinfo.length; i++){
    async function initBrowser() {
        const browser = await puppeteer.launch({ executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", args: ['--no-sandbox'], headless: false, slowMo: 15 });
        const page = await browser.newPage();
        return page;
    }
    
    async function addToCart(page){
        await page.goto(itemUrl);
        await page.waitForXPath("/html/body/div[2]/div/div[2]/div/form/fieldset[2]/input", {timeout: 6000000});
        // Waits for the page to load 
        
        //await page.waitForXPath('/html/body/div[2]/div/div[2]/div/form/fieldset[2]/a');  <- for the try catch if OOS     
        /*try{
            await page.waitForXPath("/html/body/div[2]/div/div[2]/div/form/fieldset[2]/input");            
            // If the product is not in stock, it triggers function outOfStockError, 
            // else starts adding product to cart (skips catch block)
        }catch{
            console.log("OOS "+i);
            await outOfStockError(page);
        }*/
        console.log("Adding to cart " +i);
        await page.$eval("input[value='add to basket']", elem => elem.click());
        await page.waitForTimeout(delay);
        await page.waitForXPath('/html/body/div[2]/div/div[1]/div/a[2]');
        await page.$eval("a[href='https://www.supremenewyork.com/checkout']", elem => elem.click());
        console.timeLog();        
    }
    
    async function retyAddToCart(page){
        await page.goto(itemUrl);
        page.waitForTimeout(delay)
        await page.$eval("a[href='https://www.supremenewyork.com/checkout']", elem => elem.click());
        console.log("Product still in stock " +i)
        }

    async function shipping(page){
        await page.waitForXPath('/html/body/div[2]/div[1]/form/div[2]/div[1]/fieldset/div[1]/input');
        console.log("Submitting shipping information "+i);
        await page.type('#order_billing_name', profilesinfo[i].fullName);
        await page.type('#order_email', profilesinfo[i].email);
        await page.type('#order_tel', profilesinfo[i].tel);    
        await page.type('#order_billing_address', shippinginfo[i].address);    
        await page.type('#order_billing_city', shippinginfo[i].city);    
        await page.select('#order_billing_country', shippinginfo[i].country);    
        await page.type('#order_billing_zip', shippinginfo[i].postcode); 
    }
    async function payment(page){
        await page.waitForXPath('/html/body/div[2]/div[1]/form/div[2]/div[2]/fieldset/div[3]/div[1]/input');
        console.log("Submitting payment information "+i);
        await page.type('#credit_card_number', paymentinfo[i].creditCardNumber);
        await page.select('#credit_card_month', paymentinfo[i].expMonth);
        await page.select('#credit_card_year', paymentinfo[i].expYear);
        await page.type('#credit_card_verification_value', paymentinfo[i].cvv);
        await page.click('#order_terms');
        await page.$eval("input[value='process payment']", elem => elem.click());
        console.log("Waiting for captcha " + i);
    }

    /*async function outOfStockError(page){
        console.log("Reloading product page in 5s "+ i);
        await page.waitForTimeout(5000);
        await page.reload();        
        await addToCart(page);
    }*/

    async function cartingError(page){
        await page.waitForTimeout(1000);
        let url = await page.url();
        if (url == basketUrl){
            console.log("Redirected correctly " + i);
            await shipping(page);
            await payment(page);
            //Continues checkout process
        }else{
            console.log(url+ " " + i);
            console.log("Rety add to cart (possible OOS) " + i);
            await retyAddToCart(page);
            await cartingError(page);
            //repeats add to cart (possible OOS)
        }
    }

    async function checkout(){
        const page = await initBrowser(); 
        await page.setDefaultTimeout(10000000);
        await addToCart(page);
        await cartingError(page);
        //Check if redirect to checkout link was made correctly
        //(this could happen if product is OOS or if there is an error on Supremes side)
        console.timeLog();  
    }

    checkout();
    
}
