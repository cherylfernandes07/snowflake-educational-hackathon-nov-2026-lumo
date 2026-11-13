import{test}from'node:test';import assert from'node:assert/strict';
import{newBrain,teachBrain,brainTransfer,restoreBrain,beliefFlags}from'../lib/brain';
import{missions}from'../lib/curriculum';
import{allowedSource,searchDomain}from'../lib/source-policy';
const explanation='NASA explains the Great Wall cannot be seen from the Moon with the unaided eye. Popularity is not proof; we need evidence.';
test('a supported lesson persists actual evidence and changes transfer behavior',()=>{
 const before=newBrain(),after=teachBrain(before,explanation,0,'false',missions[0].source);
 assert.equal(before.beliefs.find(b=>b.id==='popularity')?.status,'incorrect');
 const rule=after.beliefs.find(b=>b.id==='popularity')!;
 assert.equal(rule.status,'correct');assert.equal(rule.studentEvidence?.explanation,explanation);assert.deepEqual(rule.studentEvidence?.sourceUrls,[missions[0].source.url]);
 assert.ok(brainTransfer(after).includes('popular doesn’t mean true'));
 assert.deepEqual(restoreBrain(JSON.parse(JSON.stringify(after))),after);
});
test('generic praise, wrong conclusions and irrelevant publishers cannot update brain or answers',()=>{
 const before=newBrain();for(const [text,choice,source]of [['evidence because NASA','false',missions[0].source],[explanation,'true',missions[0].source],[explanation,'false',{...missions[0].source,url:'https://example.com'}]]as const){assert.deepEqual(teachBrain(before,text,0,choice,source),before);}
 assert.equal(missions[0].answer,'The Great Wall cannot be seen from the Moon with the unaided eye.');
});
test('legacy belief flags migrate without inventing supporting explanations',()=>{
 const brain=restoreBrain(null,{popularity:true});assert.ok(beliefFlags(brain).popularity);assert.equal(brain.beliefs[0].studentEvidence,null);assert.ok(brain.beliefs[0].migrated);
});
test('source curation rejects lookalike domains and chooses relevant science scope',()=>{
 assert.ok(allowedSource('https://science.nasa.gov/moon/'));assert.ok(!allowedSource('https://nasa.gov.evil.example/'));
 assert.ok(!allowedSource('http://nasa.gov/'));assert.ok(!allowedSource('https://localhost/'));
 assert.equal(searchDomain('lightning',0,true),'weather.gov');assert.equal(searchDomain('space',0,false),'nasa.gov');
});

test('factual correction cannot smuggle an incorrect popularity or AI principle into the brain',()=>{
 const text='NASA explains the Great Wall cannot be seen from the Moon. Popular posts are always true. AI never makes mistakes.';
 const brain=teachBrain(newBrain(),text,0,'false',missions[0].source);
 assert.ok(beliefFlags(brain).evidence);assert.ok(!beliefFlags(brain).popularity);assert.ok(!beliefFlags(brain).ai);
});
