import { test, expect } from '@playwright/test';

test('animation lab exposes the contract, layered combination, and honest asset states', async ({ page }) => {
  await page.goto('/animation-lab');
  await expect(page.getByRole('heading', {name:'Lumo’s animation lab'})).toBeVisible();
  await expect(page.getByText('Interactive SVG preview · no Rive asset loaded.', {exact:true})).toBeVisible();
  await page.getByRole('button', {name:'Try the combination'}).click();
  await expect(page.getByLabel('coreState', {exact:true})).toHaveValue('2');
  await expect(page.getByLabel('emotion', {exact:true})).toHaveValue('1');
  await expect(page.getByLabel('gesture', {exact:true})).toHaveValue('4');
  await page.getByLabel('lookX', {exact:true}).fill('0.7');
  await expect(page.getByLabel('lookX', {exact:true})).toHaveValue('0.7');
  await page.getByRole('button', {name:'fxSpark (0)'}).click();
  await expect(page.getByRole('button', {name:'fxSpark (1)'})).toBeVisible();
  await expect(page.getByText('No runtime events received.', {exact:true})).toBeVisible();
  await page.getByRole('button', {name:'Load public/clumsy.riv'}).click();
  await expect(page.getByText('public/clumsy.riv is not installed. Upload the exported rig above.',{exact:true})).toBeVisible();
  await page.getByRole('button', {name:'Reset all inputs'}).click();
  await expect(page.getByLabel('coreState', {exact:true})).toHaveValue('0');
});

test('invalid Rive file produces a load error rather than a success claim', async ({page}) => {
  await page.goto('/animation-lab');
  await page.getByLabel('Load Clumsy .riv').setInputFiles({name:'bad.riv',mimeType:'application/octet-stream',buffer:Buffer.from('not a Rive file')});
  await expect(page.getByText('Rive asset could not load. Check the file, artboard, network, and WASM availability.',{exact:true}).first()).toBeVisible({timeout:15000});
});


test('animation playground is linked from settings and the main character honors reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const character=page.locator('.learning-companion .robot-character');
  await expect(character).toHaveClass(/quiet-motion/);
  await expect(character).toHaveAttribute('data-gesture','1');
  expect(await character.locator('.robot-life').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('link',{name:'Animation playground'}).click();
  await expect(page.getByRole('heading',{name:'Lumo’s animation lab'})).toBeVisible();
});

test('integrated character hydrates without browser errors',async({page})=>{
  const errors:string[]=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text()+' '+JSON.stringify(m.location()));});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('.learning-companion .robot-character')).toBeVisible();
  const icon = await page.request.get('/clumsy-icon.svg');
  expect(icon.ok()).toBeTruthy();
  expect(errors).toEqual([]);
});


test('dragging sliders changes the visible SVG mouth, gaze, and pose', async ({page}) => {
  await page.goto('/animation-lab');
  const robot = page.locator('.character-box .robot-character');
  const mouth = robot.locator('.robot-aperture');
  const initialMouth = await mouth.evaluate(el => (el as SVGGraphicsElement).getBBox().height);
  const slider = page.getByRole('slider', {name:'mouthOpen', exact:true});
  const bounds = (await slider.boundingBox())!;
  await page.mouse.move(bounds.x+8,bounds.y+bounds.height/2);
  await page.mouse.down();
  await page.mouse.move(bounds.x+bounds.width-8,bounds.y+bounds.height/2,{steps:15});
  await page.mouse.up();
  expect(await mouth.evaluate(el => (el as SVGGraphicsElement).getBBox().height)).toBeGreaterThan(initialMouth+10);
  await page.getByLabel('lookX',{exact:true}).fill('1');
  await page.getByLabel('lookY',{exact:true}).fill('-1');
  await expect(robot.locator('.robot-gaze')).toHaveAttribute('transform','translate(6 -4)');
  await page.getByRole('button',{name:'Try the combination'}).click();
  await expect(robot).toHaveAttribute('data-core','think');
  await expect(robot).toHaveAttribute('data-emotion','1');
  await expect(robot).toHaveAttribute('data-gesture','4');
  const before = await robot.locator('.robot-head-pose').getAttribute('transform');
  await page.getByLabel('energy',{exact:true}).fill('1');
  await expect(robot.locator('.robot-head-pose')).not.toHaveAttribute('transform',before!);
  await page.getByLabel('motionScale',{exact:true}).fill('0');
  await expect(robot.locator('.robot-head-pose')).toHaveAttribute('transform','rotate(0 160 202)');
  expect(await robot.locator('.robot-life').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.getByRole('button',{name:'fxCheck (0)'}).click();
  await expect(robot.locator('.robot-effect')).toBeAttached();
  await page.getByRole('button',{name:'Reset all inputs'}).click();
  await expect(mouth).toHaveAttribute('ry','0.01');
  await expect(robot.locator('.robot-gaze')).toHaveAttribute('transform','translate(0 0)');
});
