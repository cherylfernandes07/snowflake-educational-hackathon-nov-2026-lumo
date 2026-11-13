import {test,expect,type Page} from '@playwright/test';
import {scoreThinking,type AIEvaluation} from '../../lib/thinking/rubric';
async function firstMoves(page:Page,question?:string,source?:string){
 await page.getByRole('button',{name:'Let’s play',exact:true}).click();
 if(question)await page.getByRole('button',{name:question,exact:true}).click();
 else await page.getByRole('button',{name:/Check .*space scientists/}).click();
 await page.getByRole('button',{name:'Keep going'}).click();
 const title=source?source:/^(Moonlight|Sun Facts)$/;
 await page.getByRole('button').filter({has:page.getByRole('heading',{name:title,exact:!!source})}).click();
 await page.getByRole('button',{name:'My last move'}).click();
}
async function practice(page:Page){
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Presenter mode'}).click();await page.getByRole('button',{name:'Settings',exact:true}).click();
 await page.getByRole('button',{name:'I’m not sure',exact:true}).click();await page.getByRole('button',{name:'Let’s find out'}).click();
 await page.getByRole('button',{name:'Find a source that knows'}).click();await page.getByRole('button',{name:'Load official demo clue'}).click();await page.getByRole('button',{name:'I’ve got a clue!'}).click();
 await page.getByRole('button',{name:'Use a demonstration explanation'}).click();
 await expect(page.getByRole('heading',{name:'The Great Wall cannot be seen from the Moon with the unaided eye.'})).toBeVisible();
 await expect(page.locator('.brain-change')).toContainText('CORRECT:');
}

test('independent assessment path saves drafts and flags unavailable evaluator for review',async({page})=>{
 const coachRequests:string[]=[];page.on('request',r=>{if(r.url().includes('/api/coach'))coachRequests.push(r.url());});
 await page.goto('/');await page.getByRole('button',{name:'Space A view from the Moon'}).click();
 await expect(page.getByRole('region',{name:'First Thinking Challenge'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Settings',exact:true})).toHaveCount(0);
 await firstMoves(page,'Trust it because the video has lots of likes','What viewers say');
 await page.getByLabel('Your idea',{exact:true}).fill('Many people liked it.');await page.reload();
 await expect(page.getByLabel('Your idea',{exact:true})).toHaveValue('Many people liked it.');
 await page.getByRole('button',{name:'Save my moves'}).click();
 await expect(page.getByRole('heading',{name:'Scientists confirm the Great Wall of China can be seen from the Moon!'})).toBeVisible();
 expect(coachRequests).toHaveLength(0);
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Lumo Thinking Skills',exact:true}).click();
 await expect(page.getByRole('dialog')).not.toContainText('0/2');await page.getByRole('button',{name:'Close Thinking Skills'}).click();
 await practice(page);await page.getByRole('button',{name:'Finish for now'}).click();await firstMoves(page);
 await page.getByLabel('Your idea',{exact:true}).fill('NASA studies the Sun. It says the Sun is a star. That supports the claim.');
 await expect(page.getByText('Your Thinking Skills',{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Save my moves'}).click();
 const summary=page.getByRole('region',{name:'Lumo Thinking Skills'});
 await expect(summary.getByText('Questioning',{exact:true})).toBeVisible();await expect(summary.getByText('+2 on this challenge',{exact:true})).toBeVisible();
 // No OpenAI credential is required to run this path; ungraded text remains explicitly reviewable.
 await expect(summary).toContainText('Needs review');await expect(summary).toContainText('Incomplete');
 expect(coachRequests).toHaveLength(0);
 await page.reload();await expect(page.getByRole('region',{name:'Lumo Thinking Skills'})).toContainText('Needs review');
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Parent/Teacher View',exact:true}).click();
 const adult=page.getByRole('region',{name:'Parent/Teacher View'});await expect(adult).toContainText('review the saved explanation');
 await expect(adult.getByRole('textbox')).toHaveCount(0);await expect(adult).toContainText('NASA explains');
});

test('evaluated fixture results show a lower after score accurately and preserve scoring evidence',async({page})=>{
 // This test supplies evaluator fixtures; it does not claim a live model was called.
 await page.route('**/api/thinking',async route=>{
  const response=route.request().postDataJSON();const before=response.assessmentType==='before';
  const evaluation:AIEvaluation={investigationJustified:before,investigationQuote:before?response.explanation:'',explanationScore:before?2:0,explanationQuote:before?response.explanation:'',explanationReason:before?'Connected evidence.':'Unsupported conclusion.',needsReview:false};
  await route.fulfill({json:{record:scoreThinking(response,evaluation)}});
 });
 await page.goto('/');await page.getByRole('button',{name:'Space A view from the Moon'}).click();await firstMoves(page);
 await page.getByLabel('Your idea',{exact:true}).fill('NASA observes the Moon. Its page says the Moon reflects sunlight, so it does not make its own light.');await page.getByRole('button',{name:'Save my moves'}).click();
 await practice(page);await page.getByRole('button',{name:'Finish for now'}).click();
 await firstMoves(page,'Repeat it because thousands of people liked it');await page.getByLabel('Your idea',{exact:true}).fill('Lots of likes make it true.');await page.getByRole('button',{name:'Save my moves'}).click();
 const summary=page.getByRole('region',{name:'Lumo Thinking Skills'});await expect(summary).toContainText('-2 on this challenge');await expect(summary).toContainText('6/6');await expect(summary).toContainText('1/6');
 await summary.getByText('See my moves and what counted').click();await expect(summary).toContainText('CORRECT CLAIM');await expect(summary).toContainText('INCORRECT CLAIM');
 await page.screenshot({path:'/tmp/lumo-full-thinking-results.png',fullPage:true});
});

test('voice transcript is stored and evaluator failures do not guess its score',async({page})=>{
 await page.addInitScript(()=>{class Recognition{onresult:((e:unknown)=>void)|null=null;onend:(()=>void)|null=null;start(){setTimeout(()=>{this.onresult?.({results:[[{transcript:'NASA says the Moon reflects sunlight, so it does not make its own light.'}]]});this.onend?.();},30);}stop(){this.onend?.();}abort(){this.onend?.();}}Object.defineProperty(window,'SpeechRecognition',{value:Recognition,configurable:true});});
 await page.goto('/');await page.getByRole('button',{name:'Space A view from the Moon'}).click();await firstMoves(page);
 await page.getByRole('button',{name:'Speak your thinking'}).click();await expect(page.getByLabel('Your idea',{exact:true})).toHaveValue('NASA says the Moon reflects sunlight, so it does not make its own light.');
 await page.getByRole('button',{name:'Save my moves'}).click();await expect(page.getByRole('heading',{name:'Scientists confirm the Great Wall of China can be seen from the Moon!'})).toBeVisible();
 const r=await page.evaluate(()=>JSON.parse(localStorage.getItem('lumo-thinking-v1')!).before);expect(r.response.modality).toBe('voice');expect(r.scores.Explaining.status).toBe('requires-review');
});

test('skipping baseline and explanation does not invent scores; save failures retain drafts',async({page,request})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:'Space A view from the Moon'}).click();await page.getByRole('button',{name:'Skip this challenge for now'}).click();
 await practice(page);await page.getByRole('button',{name:'Finish for now'}).click();await firstMoves(page);
 await page.route('**/api/thinking',r=>r.abort());await page.getByRole('button',{name:'Save my moves'}).click();await expect(page.getByRole('status')).toContainText('answers are still here');
 await page.unroute('**/api/thinking');await page.getByRole('button',{name:'Save my moves'}).click();
 const summary=page.getByRole('region',{name:'Lumo Thinking Skills'});await expect(summary).toContainText('cannot measure a before-and-after change');await expect(summary.getByText('Not assessed',{exact:true})).toHaveCount(5);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 const invalid=await request.post('/api/thinking',{data:{challengeId:'invented'}});expect(invalid.status()).toBe(400);
});

test('sample demo remains playable offline and never overwrites actual student progress',async({page})=>{
 await page.route('**/api/search',r=>r.abort());await page.route('**/api/coach',r=>r.abort());await page.route('**/api/thinking',r=>r.abort());
 await page.goto('/');await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Run 90-second sample demo'}).click();
 const before=await page.evaluate(()=>localStorage.getItem('lumo-thinking-v1'));
 await page.getByRole('button',{name:'Use sample first moves'}).click();await page.getByRole('button',{name:'Challenge Lumo’s guess'}).click();await page.getByRole('button',{name:'Find a clue',exact:true}).click();
 await page.getByRole('button',{name:'Try live Keenable search'}).click();await expect(page.getByText('Preloaded official evidence · network unavailable')).toBeVisible();
 await page.getByRole('button',{name:'Teach this principle'}).click();await expect(page.getByText('Popularity is not proof. Check evidence.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Try a new situation'}).click();await expect(page.getByText('Wait! You taught me',{exact:false})).toBeVisible();
 await page.getByRole('button',{name:'Use sample final moves'}).click();await expect(page.getByRole('region',{name:'Lumo Thinking Skills'})).toContainText('SAMPLE DATA');await expect(page.getByRole('region',{name:'Lumo Thinking Skills'})).toContainText('6/6');
 expect(await page.evaluate(()=>localStorage.getItem('lumo-thinking-v1'))).toBe(before);
 await page.getByRole('button',{name:'Student View',exact:true}).click();await expect(page.getByRole('heading',{name:'My brain needs a human like you.'})).toBeVisible();
});
