import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile('reference/homepage.html', 'utf8');
const services = source.slice(source.indexOf('<section class="section-4'), source.indexOf('<section class="section-5'));
const cards = [...services.matchAll(/<img[^>]*data-src="([^"]+)"[^>]*>[\s\S]*?<div class="content-details fadeIn-bottom">\s*<h3>(.*?)<\/h3>\s*<p[^>]*>(.*?)<\/p>\s*<a[^>]*href="([^"]+)"/g)].map(([, image, name, description, href], index) => `
        <details class="service-card" data-service-card>
          <summary class="service-summary" aria-label="View ${name.replaceAll('&', '&amp;')} service details">
            <img src="./assets/images/${image.split('/').pop()}" alt="${name.replaceAll('&', '&amp;')} plumbing service" width="336" height="392" loading="lazy" class="h-full w-full object-cover">
            <span class="absolute right-0 bottom-[50px] left-0 z-10 text-center text-white"><span class="service-heading block">${name}</span><span class="mx-auto flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white" aria-hidden="true">›</span></span>
          </summary>
          <div class="service-details">
            <button type="button" class="absolute top-2 right-3 px-2 text-2xl" data-close-service aria-label="Close ${name.replaceAll('&', '&amp;')} details">×</button>
            <h3 class="service-heading">${name}</h3><p class="mb-5 line-clamp-5 text-base leading-[1.7]">${description}</p>
            <a href="${href}" class="border-2 border-white bg-white px-6 py-4 text-sm font-extrabold text-ink uppercase transition-colors hover:bg-transparent hover:text-white" aria-label="Read more about ${name.replaceAll('&', '&amp;')}">Read More</a>
          </div>
        </details>`);
if (cards.length !== 12) throw new Error(`Expected 12 services; found ${cards.length}`);

const guarantees = [
  ['e84d', 'On-Time, Every Time'], ['e84c', 'Fixed Price Guarantee'], ['e849', 'Workmanship Warrantee'],
  ['e84a', 'Respect For Your Home'], ['e800', 'Highly-Trained Plumbers'], ['e848', '100% Customer Satisfaction']
].map(([icon, title]) => `<li class="guarantee-card"><span class="icon text-[50px] leading-none text-brand" aria-hidden="true">&#x${icon};</span><h3 class="mt-4 font-heading text-base leading-[1.2] font-extrabold uppercase">${title}</h3></li>`).join('\n');

const sections = `
    <section id="services" class="my-4 border-b-2 border-soft py-12" aria-labelledby="services-heading">
      <div class="site-container">
        <div class="section-intro"><p class="preheading">Industry-Leading Plumbing Solutions</p><h2 id="services-heading" class="section-heading">Our Plumbing Services</h2><p class="body-copy">We offer a <strong class="font-semibold">full-service plumbing solution in the Sunshine Coast, Noosa, and Moreton Bay regions. From</strong> blocked drains and hot water systems to gas services, we bring experience, knowledge, and expertise to every plumbing job we do.</p></div>
        <div class="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-4" aria-label="Plumbing services; swipe for more on mobile">${cards.join('')}</div>
        <div class="pt-12 text-center"><a href="https://bigblueplumbing.au/services" class="button">View All Services <span aria-hidden="true">---&gt;</span></a></div>
      </div>
    </section>
    <section id="reasons" class="my-4 py-12" aria-labelledby="reasons-heading">
      <div class="site-container">
        <div class="section-intro"><p class="preheading">Expect Nothing But The Best</p><h2 id="reasons-heading" class="section-heading">3 Reasons Why You Should Choose Us</h2><p class="body-copy">Whether you need business, strata, commercial, or residential plumbing, you deserve the absolute best. That’s why we take small steps to ensure we make a big difference.</p></div>
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-6">
          <img src="./assets/images/reasons-to-choose-big-blue-696x459.jpg" alt="Big Blue Plumbing team and service vehicle" width="696" height="459" loading="lazy" class="h-auto w-full">
          <ol class="space-y-12">
            <li class="reason-item"><span class="reason-number"><span class="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-semibold text-white">1</span></span><h3 class="py-2.5 font-heading text-[19.2px] leading-[1.2] font-extrabold uppercase">We only use quality products.</h3><p class="body-copy">From toilets to faucets to showerheads and piping, you know the products we install are only the best.</p></li>
            <li class="reason-item"><span class="reason-number"><span class="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-semibold text-white">2</span></span><h3 class="py-2.5 font-heading text-[19.2px] leading-[1.2] font-extrabold uppercase">Genuine care for your property.</h3><p class="body-copy">All our technicians must wear protective sleeves over their boots, remove rubbish, and treat your property like their own.</p></li>
            <li class="reason-item"><span class="reason-number"><span class="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-semibold text-white">3</span></span><h3 class="py-2.5 font-heading text-[19.2px] leading-[1.2] font-extrabold uppercase">On-time, every time, 24-hours a day.</h3><p class="body-copy">Disaster can strike at any time; our plumbers will be onsite to repair your plumbing exactly when we say we will.</p></li>
          </ol>
        </div>
      </div>
    </section>
    <section id="financing" class="bg-brand py-12 text-white lg:py-24" aria-labelledby="financing-heading">
      <div class="site-container grid items-center gap-8 lg:grid-cols-2 lg:gap-6">
        <div class="order-2 lg:order-1"><p class="preheading text-white">Making Hard Times; Easy.</p><h2 id="financing-heading" class="section-heading">0% Interest Payment Plan, Thanks to Brighte</h2><blockquote class="body-copy mb-4">“Oh s&amp;!#, a hot water system costs how much”?</blockquote><p class="body-copy">We have all been there; unexpected costs like a replacement hot water system or a blocked drain that needs pipe relining can get expensive. We have introduced our interest-free plan to help when you need it most.</p>
          <div class="mt-12 grid gap-4 sm:grid-cols-2">
            <div class="flex items-center gap-[15px] border border-white p-5"><span class="icon flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-white text-[32px] text-brand" aria-hidden="true">&#xe83f;</span><div><h3 class="font-heading text-[18.4px] leading-[1.2] font-extrabold uppercase">0% Interest Plans</h3><p class="pt-2.5 text-[14.4px] leading-[1.7]">No catches or gimmicks, have an option to spend now, pay later!</p></div></div>
            <div class="flex items-center gap-[15px] border border-white p-5"><span class="icon flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-white text-[32px] text-brand" aria-hidden="true">&#xe83f;</span><div><h3 class="font-heading text-[18.4px] leading-[1.2] font-extrabold uppercase">5–7 Minute Approval</h3><p class="pt-2.5 text-[14.4px] leading-[1.7]">Apply, and have an outcome in minutes.</p></div></div>
          </div>
        </div>
        <img src="./assets/images/big-blue-finance.png" alt="0% interest payment plan with Brighte" width="561" height="575" loading="lazy" class="order-1 mx-auto h-auto w-[300px] max-w-full lg:order-2 xl:w-[561px]">
      </div>
    </section>
    <section id="call-us" class="relative flex min-h-[375px] items-center bg-ink py-12 text-white" aria-labelledby="call-heading">
      <div class="site-container grid items-center gap-6 lg:grid-cols-3">
        <div><p class="preheading">Connect With Us</p><h2 id="call-heading" class="section-heading">Looking for a local plumber?</h2></div>
        <div class="relative hidden h-full lg:block"><img src="./assets/images/plumber-center.png" alt="Big Blue plumber pointing toward our contact number" width="405" height="439" loading="lazy" class="absolute bottom-[-48px] left-1/2 h-auto w-[335px] max-w-none -translate-x-1/2"></div>
        <div><p class="body-copy">If you have any questions or need an <strong class="font-semibold">emergency plumber</strong>, feel free to contact our team of plumbers by calling the phone number below.</p><a href="tel:0754049354" class="mt-12 flex items-center gap-5 hover:text-brand"><span class="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-call-ring"><span class="icon flex h-10 w-10 items-center justify-center rounded-full bg-brand text-2xl text-white" aria-hidden="true">&#xe838;</span></span><span><span class="block text-sm font-semibold uppercase">Call Us Now</span><span class="font-heading text-2xl font-extrabold">(07) 5404 9354</span></span></a></div>
      </div>
    </section>
    <section id="about" class="py-12" aria-labelledby="about-heading">
      <div class="site-container"><div class="mx-auto text-center lg:w-2/3"><p class="preheading">Who are we?</p><h2 id="about-heading" class="section-heading">Meet Big Blue Plumbing</h2><p class="body-copy">Big Blue Plumbing is one of the premier providers of plumbing solutions in South East Queensland; we aim to offer the highest quality plumbing at affordable prices whilst also being the name in plumbing locals have known and trusted since we started.</p></div></div>
      <div class="site-container mt-24 grid gap-8 py-12 lg:grid-cols-2 lg:gap-6">
        <div><h3 class="section-heading">We’re so much more than your average local plumber</h3><p class="body-copy">With over <strong class="font-semibold">40 years of combined plumbing experience</strong> and collaboration with business experts and customer-experience specialists, Big Blue Plumbing has formulated an experience unlike any other. When you use Big Blue, you know you’re getting world-class customer service from plumbers who know everything so that your experience is like nothing else.</p></div>
        <img src="./assets/images/downpipe-plumbing-696x459.jpg" alt="Plumber working on a downpipe at a home" width="696" height="459" loading="lazy" class="h-auto w-full">
      </div>
    </section>
    <section id="guarantees" class="bg-ink py-12 text-white" aria-labelledby="guarantees-heading">
      <div class="site-container"><div class="section-intro"><p class="preheading">Why Choose Big Blue Plumbing</p><h2 id="guarantees-heading" class="section-heading">Why Choose Us</h2><p class="body-copy">We are the Sunshine Coast’s plumbing specialists, and we know a thing or two about what customers expect from a local plumbing company; we do everything you expect and much more.</p></div>
        <div class="grid items-center gap-6 lg:grid-cols-2"><img src="./assets/images/why-choose-big-blue-696x459.png" alt="Big Blue Plumbing team ready to help" width="696" height="459" loading="lazy" class="order-2 h-auto w-full lg:order-1"><ul class="order-1 grid grid-cols-2 gap-6 md:grid-cols-3 lg:order-2">${guarantees}</ul></div>
      </div>
    </section>
    <!-- Stage 4 continues here after review. -->`;

const html = await readFile('index.html', 'utf8');
const marker = '<!-- Stage 3 continues here after review. -->';
if (!html.includes(marker)) throw new Error('Stage 3 insertion marker missing; refusing to duplicate sections.');
await writeFile('index.html', html.replace(marker, sections));
console.log('Added 12 services, reasons, financing, call banner, introduction, and six guarantees.');
