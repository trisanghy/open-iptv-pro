import test from 'node:test';import assert from 'node:assert/strict';
import {AUTO_PIP_SETTING,shouldArmAutoPiP,initialAutoPiPEnabled} from '../src/mobile-auto-pip.mjs';
test('automatic PiP is opt-in and never activates on first install',()=>{
 assert.equal(initialAutoPiPEnabled({}),false);
 assert.equal(shouldArmAutoPiP({},true,false),false);
 assert.equal(shouldArmAutoPiP({[AUTO_PIP_SETTING]:true},false,false),false);
});
test('PiP arms only with active inline playback and explicit consent',()=>{
 const settings={[AUTO_PIP_SETTING]:true};
 assert.equal(shouldArmAutoPiP(settings,true,false),true);
 assert.equal(shouldArmAutoPiP(settings,true,true),false);
 assert.equal(shouldArmAutoPiP(settings,false,false),false);
});
test('saved false has priority and does not arm even if video playing',()=>{
 assert.equal(shouldArmAutoPiP({[AUTO_PIP_SETTING]:false},true,false),false);
});
