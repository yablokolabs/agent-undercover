import { chromium } from '@playwright/test';
const b=await chromium.launch({headless:true}); const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://localhost:5173/',{waitUntil:'networkidle'}); await p.getByRole('checkbox').first().check(); await p.getByRole('button',{name:'Start mission'}).click(); await p.getByRole('button',{name:'Allow for this session'}).click(); await p.waitForSelector('.outcome-badge');
console.log('before', await p.evaluate(()=>({sy:scrollY, se:document.scrollingElement?.scrollTop, body:document.body.scrollTop, main:document.querySelector('main')?.scrollTop, caseTop:document.querySelector('.case-file, .main-area')?.getBoundingClientRect().top})));
await p.evaluate(()=>{window.scrollTo(0,0); document.scrollingElement?.scrollTo?.(0,0); document.body.scrollTop=0; document.querySelector('main')?.scrollTo?.(0,0);});
await p.waitForTimeout(500);
console.log('after', await p.evaluate(()=>({sy:scrollY, se:document.scrollingElement?.scrollTop, body:document.body.scrollTop, main:document.querySelector('main')?.scrollTop, caseTop:document.querySelector('.case-file, .main-area')?.getBoundingClientRect().top})));
await p.screenshot({path:'/tmp/scrolled.png'});
await b.close();
