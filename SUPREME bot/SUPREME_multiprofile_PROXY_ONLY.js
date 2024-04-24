const puppeteer = require ('puppeteer');

const profilesinfo = [{fullName:"mY NAME",email:"mygmail1@gmail.com",tel:"000000001"},
{fullName:"Name my",email:"mymail2@gmail.com",tel:"000000002"},
{fullName:"name Surname",email:"mygmail3@gmail.com",tel:"0038600000003"}];

const shippinginfo = [{address:"example adress 1",city:"mycity",country:"SI",postcode:"1000"},
{address:"example adress 2",city:"My city",country:"SI",postcode:"1001"},
{address:"example street 3",city:"myCity",country:"SI",postcode:"1002"}];

const paymentinfo = [{creditCardNumber:"5511223688654937",expMonth:"08",expYear:"2022",cvv:"000"},
{creditCardNumber:"5511223688654973",expMonth:"07",expYear:"2022",cvv:"111"},
{creditCardNumber:"5511223688659437",expMonth:"08",expYear:"2023",cvv:"001"}];

const proxyList = ["https://5BW629P9K060BB4WRXVPFBRD:8084",
    "http://88.198.24.108:3128",
    "http://88.198.50.103:8080",
    "http://46.4.96.137:3128"
]

const delay = 300;
const paymentDelay = 100;
const itemUrl = "https://www.supremenewyork.com/shop/t-shirts/wo6pdt7wb";
const basketUrl = "https://www.supremenewyork.com/checkout"

for (let i=0; i < profilesinfo.length; i++){
    async function initBrowser() {
        const browser = await puppeteer.launch({headless: false,
        args:['--proxy-server=' + proxyList[i]]
        });
        const page = await browser.newPage();
        await page.goto(itemUrl);
        return page;
    }
    async function addToCart(page){
        await page.waitForXPath('/html/body/div[2]/div/div[2]/div/form/fieldset[2]/input');
        console.log("Adding to cart");
        await page.$eval("input[value='add to basket']", elem => elem.click());
        await page.waitFor(delay);
        await page.waitForXPath('/html/body/div[2]/div/div[1]/div/a[2]');
        //await page.goto(basketUrl);
        await page.$eval("a[href='https://www.supremenewyork.com/checkout']", elem => elem.click());

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
    }
    async function checkout(){
        const page = await initBrowser(); 
        //console.time()
        await page.setDefaultNavigationTimeout(60000000);
        await addToCart(page);
        await shipping(page);
        await payment(page);
        //console.timeEnd()
        //await captcha(page);
        }

    checkout();
    console.log(profilesinfo[i].fullName)
    
}
