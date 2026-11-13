import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assess,initialBeliefs,transferSpeech,missions} from '../lib/curriculum';
test('unsupported answers do not meet evidence rubric',()=>{assert.equal(assess('It is true because everybody says so').score,0);assert.equal(assess('I disagree').popularity,false)});
test('evidence and explanation are separate criteria',()=>{assert.equal(assess('I should check a source').score,2);assert.equal(assess('NASA explains it cannot be seen with the unaided eye').score,3)});
test('popularity correction needs both a challenge and evidence',()=>{assert.equal(assess('Lots of likes make it true').popularity,false);const a=assess('Likes do not make it true. We need evidence from NASA.');assert.ok(a.popularity&&a.evidence)});
test('transfer behavior actually depends on updated beliefs',()=>{assert.ok(!transferSpeech(initialBeliefs).includes('You taught me'));assert.ok(transferSpeech({...initialBeliefs,popularity:true}).includes('You taught me'))});
test('reference keys use the official sources',()=>{assert.ok(missions[0].source.url.startsWith('https://www.nasa.gov/'));assert.ok(missions[1].source.url.startsWith('https://www.weather.gov/'))});

test('spoken and typographic contractions count as popularity challenges',()=>{assert.ok(assess('Lots of likes don’t make a claim true. We need evidence from NASA.').popularity)});

test('an evidence lesson changes the next question even without a popularity lesson',()=>{assert.ok(transferSpeech({...initialBeliefs,evidence:true}).includes('check the evidence first'))});
