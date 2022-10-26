var app=function(){"use strict";function e(){}function t(e,t){for(const n in t)e[n]=t[n];return e}function n(e){return e()}function o(){return Object.create(null)}function r(e){e.forEach(n)}function a(e){return"function"==typeof e}function c(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function l(t,n,o){t.$$.on_destroy.push(function(t,...n){if(null==t)return e;const o=t.subscribe(...n);return o.unsubscribe?()=>o.unsubscribe():o}(n,o))}function i(e,t,n){return e.set(n),t}function s(e,t){e.appendChild(t)}function u(e,t,n){e.insertBefore(t,n||null)}function m(e){e.parentNode.removeChild(e)}function f(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function p(e){return document.createElement(e)}function d(e){return document.createElementNS("http://www.w3.org/2000/svg",e)}function $(e){return document.createTextNode(e)}function g(){return $(" ")}function h(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function v(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function C(e){return""===e?null:+e}function b(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}function y(e,t){e.value=null==t?"":t}function w(e,t){for(let n=0;n<e.options.length;n+=1){const o=e.options[n];if(o.__value===t)return void(o.selected=!0)}e.selectedIndex=-1}function L(e,t,n){e.classList[n?"add":"remove"](t)}let x;function S(e){x=e}function M(){const e=function(){if(!x)throw new Error("Function called outside component initialization");return x}();return(t,n,{cancelable:o=!1}={})=>{const r=e.$$.callbacks[t];if(r){const a=function(e,t,{bubbles:n=!1,cancelable:o=!1}={}){const r=document.createEvent("CustomEvent");return r.initCustomEvent(e,n,o,t),r}(t,n,{cancelable:o});return r.slice().forEach((t=>{t.call(e,a)})),!a.defaultPrevented}return!0}}function _(e,t){const n=e.$$.callbacks[t.type];n&&n.slice().forEach((e=>e.call(this,t)))}const k=[],z=[],V=[],A=[],H=Promise.resolve();let E=!1;function O(e){V.push(e)}function N(e){A.push(e)}const I=new Set;let T=0;function J(){const e=x;do{for(;T<k.length;){const e=k[T];T++,S(e),j(e.$$)}for(S(null),k.length=0,T=0;z.length;)z.pop()();for(let e=0;e<V.length;e+=1){const t=V[e];I.has(t)||(I.add(t),t())}V.length=0}while(k.length);for(;A.length;)A.pop()();E=!1,I.clear(),S(e)}function j(e){if(null!==e.fragment){e.update(),r(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(O)}}const q=new Set;let B;function R(){B={r:0,c:[],p:B}}function F(){B.r||r(B.c),B=B.p}function P(e,t){e&&e.i&&(q.delete(e),e.i(t))}function U(e,t,n,o){if(e&&e.o){if(q.has(e))return;q.add(e),B.c.push((()=>{q.delete(e),o&&(n&&e.d(1),o())})),e.o(t)}else o&&o()}function D(e,t,n){const o=e.$$.props[t];void 0!==o&&(e.$$.bound[o]=n,n(e.$$.ctx[o]))}function W(e){e&&e.c()}function Z(e,t,o,c){const{fragment:l,on_mount:i,on_destroy:s,after_update:u}=e.$$;l&&l.m(t,o),c||O((()=>{const t=i.map(n).filter(a);s?s.push(...t):r(t),e.$$.on_mount=[]})),u.forEach(O)}function G(e,t){const n=e.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function K(e,t){-1===e.$$.dirty[0]&&(k.push(e),E||(E=!0,H.then(J)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function Q(t,n,a,c,l,i,s,u=[-1]){const f=x;S(t);const p=t.$$={fragment:null,ctx:null,props:i,update:e,not_equal:l,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(n.context||(f?f.$$.context:[])),callbacks:o(),dirty:u,skip_bound:!1,root:n.target||f.$$.root};s&&s(p.root);let d=!1;if(p.ctx=a?a(t,n.props||{},((e,n,...o)=>{const r=o.length?o[0]:n;return p.ctx&&l(p.ctx[e],p.ctx[e]=r)&&(!p.skip_bound&&p.bound[e]&&p.bound[e](r),d&&K(t,e)),n})):[],p.update(),d=!0,r(p.before_update),p.fragment=!!c&&c(p.ctx),n.target){if(n.hydrate){const e=function(e){return Array.from(e.childNodes)}(n.target);p.fragment&&p.fragment.l(e),e.forEach(m)}else p.fragment&&p.fragment.c();n.intro&&P(t.$$.fragment),Z(t,n.target,n.anchor,n.customElement),J()}S(f)}class X{$destroy(){G(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const Y=[];const ee=["CSV","JSON"],te=["Red Near","Red Mid","Red Far","Blue Near","Blue Mid","Blue Far"],ne=function(t,n=e){let o;const r=new Set;function a(e){if(c(t,e)&&(t=e,o)){const e=!Y.length;for(const e of r)e[1](),Y.push(e,t);if(e){for(let e=0;e<Y.length;e+=2)Y[e][0](Y[e+1]);Y.length=0}}}return{set:a,update:function(e){a(e(t))},subscribe:function(c,l=e){const i=[c,l];return r.add(i),1===r.size&&(o=n(a)||e),c(t),()=>{r.delete(i),0===r.size&&(o(),o=null)}}}}({location:"Red Near",team:"",match:1,isAbsent:!1,template:null,metrics:[],menuVisible:!1}),oe={metrics:[{name:"Upper Scored",type:"number",group:"Auto"},{name:"Lower Scored",type:"number"},{name:"Taxi",type:"toggle"},{name:"Upper Scored",type:"number",group:"Teleop"},{name:"Lower Scored",type:"number"},{name:"Climb",type:"select",values:["Not attempted","Low","Mid","High","Traversal","Failed"],group:"Endgame"},{name:"Playstyle",type:"select",values:["Unknown","Offensive","Defensive","Mixed"],group:"Misc"},{name:"Driver Skill",type:"rating"},{name:"Swerve Drive",type:"toggle"},{name:"Comments",type:"text"}]},re=[{name:"toggle",default:!1},{name:"number",default:0},{name:"select",default:0},{name:"text",default:""},{name:"rating",default:0},{name:"timer",default:0}];function ae(e){var t;return null===(t=re.find((t=>t.name==e)))||void 0===t?void 0:t.default}function ce(e){return[{name:"Team",value:e.team},{name:"Match",value:e.match},{name:"Absent",value:e.isAbsent},...e.metrics.map((e=>({name:e.name,value:e.value})))]}function le(e){localStorage.setItem("backup",JSON.stringify(ce(e)))}const ie=[{name:"bars",width:448,path:"M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z"},{name:"copy",width:512,path:"M384 96L384 0h-112c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48H464c26.51 0 48-21.49 48-48V128h-95.1C398.4 128 384 113.6 384 96zM416 0v96h96L416 0zM192 352V128h-144c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48h192c26.51 0 48-21.49 48-48L288 416h-32C220.7 416 192 387.3 192 352z"},{name:"check",width:448,path:"M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM339.8 211.8C350.7 200.9 350.7 183.1 339.8 172.2C328.9 161.3 311.1 161.3 300.2 172.2L192 280.4L147.8 236.2C136.9 225.3 119.1 225.3 108.2 236.2C97.27 247.1 97.27 264.9 108.2 275.8L172.2 339.8C183.1 350.7 200.9 350.7 211.8 339.8L339.8 211.8z"},{name:"download",width:512,path:"M480 352h-133.5l-45.25 45.25C289.2 409.3 273.1 416 256 416s-33.16-6.656-45.25-18.75L165.5 352H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h448c17.67 0 32-14.33 32-32v-96C512 366.3 497.7 352 480 352zM432 456c-13.2 0-24-10.8-24-24c0-13.2 10.8-24 24-24s24 10.8 24 24C456 445.2 445.2 456 432 456zM233.4 374.6C239.6 380.9 247.8 384 256 384s16.38-3.125 22.62-9.375l128-128c12.49-12.5 12.49-32.75 0-45.25c-12.5-12.5-32.76-12.5-45.25 0L288 274.8V32c0-17.67-14.33-32-32-32C238.3 0 224 14.33 224 32v242.8L150.6 201.4c-12.49-12.5-32.75-12.5-45.25 0c-12.49 12.5-12.49 32.75 0 45.25L233.4 374.6z"},{name:"erase",width:512,path:"M480 416C497.7 416 512 430.3 512 448C512 465.7 497.7 480 480 480H150.6C133.7 480 117.4 473.3 105.4 461.3L25.37 381.3C.3786 356.3 .3786 315.7 25.37 290.7L258.7 57.37C283.7 32.38 324.3 32.38 349.3 57.37L486.6 194.7C511.6 219.7 511.6 260.3 486.6 285.3L355.9 416H480zM265.4 416L332.7 348.7L195.3 211.3L70.63 336L150.6 416L265.4 416z"},{name:"minus",width:448,path:"M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"},{name:"nocheck",width:448,path:"M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM384 80H64C55.16 80 48 87.16 48 96V416C48 424.8 55.16 432 64 432H384C392.8 432 400 424.8 400 416V96C400 87.16 392.8 80 384 80z"},{name:"nostar",width:576,path:"M287.9 0C297.1 0 305.5 5.25 309.5 13.52L378.1 154.8L531.4 177.5C540.4 178.8 547.8 185.1 550.7 193.7C553.5 202.4 551.2 211.9 544.8 218.2L433.6 328.4L459.9 483.9C461.4 492.9 457.7 502.1 450.2 507.4C442.8 512.7 432.1 513.4 424.9 509.1L287.9 435.9L150.1 509.1C142.9 513.4 133.1 512.7 125.6 507.4C118.2 502.1 114.5 492.9 115.1 483.9L142.2 328.4L31.11 218.2C24.65 211.9 22.36 202.4 25.2 193.7C28.03 185.1 35.5 178.8 44.49 177.5L197.7 154.8L266.3 13.52C270.4 5.249 278.7 0 287.9 0L287.9 0zM287.9 78.95L235.4 187.2C231.9 194.3 225.1 199.3 217.3 200.5L98.98 217.9L184.9 303C190.4 308.5 192.9 316.4 191.6 324.1L171.4 443.7L276.6 387.5C283.7 383.7 292.2 383.7 299.2 387.5L404.4 443.7L384.2 324.1C382.9 316.4 385.5 308.5 391 303L476.9 217.9L358.6 200.5C350.7 199.3 343.9 194.3 340.5 187.2L287.9 78.95z"},{name:"pause",width:384,path:"M272 63.1l-32 0c-26.51 0-48 21.49-48 47.1v288c0 26.51 21.49 48 48 48L272 448c26.51 0 48-21.49 48-48v-288C320 85.49 298.5 63.1 272 63.1zM80 63.1l-32 0c-26.51 0-48 21.49-48 48v288C0 426.5 21.49 448 48 448l32 0c26.51 0 48-21.49 48-48v-288C128 85.49 106.5 63.1 80 63.1z"},{name:"pen",width:512,path:"M362.7 19.32C387.7-5.678 428.3-5.678 453.3 19.32L492.7 58.75C517.7 83.74 517.7 124.3 492.7 149.3L444.3 197.7L314.3 67.72L362.7 19.32zM421.7 220.3L188.5 453.4C178.1 463.8 165.2 471.5 151.1 475.6L30.77 511C22.35 513.5 13.24 511.2 7.03 504.1C.8198 498.8-1.502 489.7 .976 481.2L36.37 360.9C40.53 346.8 48.16 333.9 58.57 323.5L291.7 90.34L421.7 220.3z"},{name:"play",width:384,path:"M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"},{name:"plus",width:448,path:"M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"},{name:"question",width:320,path:"M204.3 32.01H96c-52.94 0-96 43.06-96 96c0 17.67 14.31 31.1 32 31.1s32-14.32 32-31.1c0-17.64 14.34-32 32-32h108.3C232.8 96.01 256 119.2 256 147.8c0 19.72-10.97 37.47-30.5 47.33L127.8 252.4C117.1 258.2 112 268.7 112 280v40c0 17.67 14.31 31.99 32 31.99s32-14.32 32-31.99V298.3L256 251.3c39.47-19.75 64-59.42 64-103.5C320 83.95 268.1 32.01 204.3 32.01zM144 400c-22.09 0-40 17.91-40 40s17.91 39.1 40 39.1s40-17.9 40-39.1S166.1 400 144 400z"},{name:"reset",width:512,path:"M480 256c0 123.4-100.5 223.9-223.9 223.9c-48.84 0-95.17-15.58-134.2-44.86c-14.12-10.59-16.97-30.66-6.375-44.81c10.59-14.12 30.62-16.94 44.81-6.375c27.84 20.91 61 31.94 95.88 31.94C344.3 415.8 416 344.1 416 256s-71.69-159.8-159.8-159.8c-37.46 0-73.09 13.49-101.3 36.64l45.12 45.14c17.01 17.02 4.955 46.1-19.1 46.1H35.17C24.58 224.1 16 215.5 16 204.9V59.04c0-24.04 29.07-36.08 46.07-19.07l47.6 47.63C149.9 52.71 201.5 32.11 256.1 32.11C379.5 32.11 480 132.6 480 256z"},{name:"save",width:448,path:"M433.1 129.1l-83.9-83.9C342.3 38.32 327.1 32 316.1 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h320c35.35 0 64-28.65 64-64V163.9C448 152.9 441.7 137.7 433.1 129.1zM224 416c-35.34 0-64-28.66-64-64s28.66-64 64-64s64 28.66 64 64S259.3 416 224 416zM320 208C320 216.8 312.8 224 304 224h-224C71.16 224 64 216.8 64 208v-96C64 103.2 71.16 96 80 96h224C312.8 96 320 103.2 320 112V208z"},{name:"star",width:576,path:"M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"},{name:"stop",width:384,path:"M384 128v255.1c0 35.35-28.65 64-64 64H64c-35.35 0-64-28.65-64-64V128c0-35.35 28.65-64 64-64H320C355.3 64 384 92.65 384 128z"}];function se(t){let n,o,a,c,l,i,f,d=t[0].location+"";return{c(){n=p("div"),o=p("button"),o.innerHTML='<img class="text-icon" id="logo" src="./logo.svg" alt=""/>MeanScout',a=g(),c=p("span"),l=$(d),v(o,"id","menu-toggle-btn"),v(c,"id","location-text"),v(n,"class","flex space-between spaced bg extend-bg")},m(e,r){u(e,n,r),s(n,o),s(n,a),s(n,c),s(c,l),i||(f=[h(window,"load",t[2]),h(o,"click",t[1])],i=!0)},p(e,[t]){1&t&&d!==(d=e[0].location+"")&&b(l,d)},i:e,o:e,d(e){e&&m(n),i=!1,r(f)}}}function ue(e,t,n){let o;return l(e,ne,(e=>n(0,o=e))),[o,function(){i(ne,o.menuVisible=!o.menuVisible,o),o.menuVisible?localStorage.setItem("menuVisible","true"):localStorage.removeItem("menuVisible")},function(){i(ne,o.menuVisible=!!localStorage.getItem("menuVisible"),o)}]}class me extends X{constructor(e){super(),Q(this,e,ue,se,c,{})}}function fe(t){let n,o,r,a,c,l,i,f;return{c(){n=p("button"),o=d("svg"),r=d("path"),l=$(t[1]),v(r,"fill","currentColor"),v(r,"d",a=t[2].path),v(o,"xmlns","http://www.w3.org/2000/svg"),v(o,"viewBox",c="0 0 "+t[2].width+" 512"),L(o,"text-icon",t[1]),L(n,"star",t[0].includes("star"))},m(e,a){u(e,n,a),s(n,o),s(o,r),s(n,l),i||(f=h(n,"click",t[3]),i=!0)},p(e,[t]){4&t&&a!==(a=e[2].path)&&v(r,"d",a),4&t&&c!==(c="0 0 "+e[2].width+" 512")&&v(o,"viewBox",c),2&t&&L(o,"text-icon",e[1]),2&t&&b(l,e[1]),1&t&&L(n,"star",e[0].includes("star"))},i:e,o:e,d(e){e&&m(n),i=!1,f()}}}function pe(e,t,n){let{icon:o=""}=t,{text:r=""}=t,a={width:0,path:""};return e.$$set=e=>{"icon"in e&&n(0,o=e.icon),"text"in e&&n(1,r=e.text)},e.$$.update=()=>{var t,r;1&e.$$.dirty&&n(2,(t=o,a=null!==(r=ie.find((e=>e.name==t)))&&void 0!==r?r:ie.find((e=>"question"==e.name))))},[o,r,a,function(t){_.call(this,e,t)}]}class de extends X{constructor(e){super(),Q(this,e,pe,fe,c,{icon:0,text:1})}}function $e(e,t,n){const o=e.slice();return o[21]=t[n],o}function ge(e,t,n){const o=e.slice();return o[18]=t[n],o}function he(e){let t,n;return{c(){t=p("span"),n=$(e[3]),v(t,"class","group")},m(e,o){u(e,t,o),s(t,n)},p(e,t){8&t&&b(n,e[3])},d(e){e&&m(t)}}}function ve(e){let t;return{c(){t=$(e[1])},m(e,n){u(e,t,n)},p(e,n){2&n&&b(t,e[1])},d(e){e&&m(t)}}}function Ce(e){let t,n,o,r,c,l,i;return t=new de({props:{icon:e[6]?"pause":"play"}}),t.$on("click",(function(){a(e[6]?e[8]:e[7])&&(e[6]?e[8]:e[7]).apply(this,arguments)})),l=new de({props:{icon:"stop"}}),l.$on("click",e[9]),{c(){W(t.$$.fragment),n=g(),o=p("span"),r=$(e[0]),c=g(),W(l.$$.fragment),v(o,"class","number")},m(e,a){Z(t,e,a),u(e,n,a),u(e,o,a),s(o,r),u(e,c,a),Z(l,e,a),i=!0},p(n,o){e=n;const a={};64&o&&(a.icon=e[6]?"pause":"play"),t.$set(a),(!i||1&o)&&b(r,e[0])},i(e){i||(P(t.$$.fragment,e),P(l.$$.fragment,e),i=!0)},o(e){U(t.$$.fragment,e),U(l.$$.fragment,e),i=!1},d(e){G(t,e),e&&m(n),e&&m(o),e&&m(c),G(l,e)}}}function be(e){let t,n,o=[...Array(5).keys()],r=[];for(let t=0;t<o.length;t+=1)r[t]=Se($e(e,o,t));const a=e=>U(r[e],1,1,(()=>{r[e]=null}));return{c(){for(let e=0;e<r.length;e+=1)r[e].c();t=$("")},m(e,o){for(let t=0;t<r.length;t+=1)r[t].m(e,o);u(e,t,o),n=!0},p(e,n){if(1&n){let c;for(o=[...Array(5).keys()],c=0;c<o.length;c+=1){const a=$e(e,o,c);r[c]?(r[c].p(a,n),P(r[c],1)):(r[c]=Se(a),r[c].c(),P(r[c],1),r[c].m(t.parentNode,t))}for(R(),c=o.length;c<r.length;c+=1)a(c);F()}},i(e){if(!n){for(let e=0;e<o.length;e+=1)P(r[e]);n=!0}},o(e){r=r.filter(Boolean);for(let e=0;e<r.length;e+=1)U(r[e]);n=!1},d(e){f(r,e),e&&m(t)}}}function ye(t){let n,o,r;return{c(){n=p("input"),v(n,"placeholder",t[5])},m(e,a){u(e,n,a),y(n,t[0]),o||(r=h(n,"input",t[14]),o=!0)},p(e,t){32&t&&v(n,"placeholder",e[5]),17&t&&n.value!==e[0]&&y(n,e[0])},i:e,o:e,d(e){e&&m(n),o=!1,r()}}}function we(t){let n,o,r,a=t[4],c=[];for(let e=0;e<a.length;e+=1)c[e]=Me(ge(t,a,e));return{c(){n=p("select");for(let e=0;e<c.length;e+=1)c[e].c();void 0===t[0]&&O((()=>t[13].call(n)))},m(e,a){u(e,n,a);for(let e=0;e<c.length;e+=1)c[e].m(n,null);w(n,t[0]),o||(r=h(n,"change",t[13]),o=!0)},p(e,t){if(16&t){let o;for(a=e[4],o=0;o<a.length;o+=1){const r=ge(e,a,o);c[o]?c[o].p(r,t):(c[o]=Me(r),c[o].c(),c[o].m(n,null))}for(;o<c.length;o+=1)c[o].d(1);c.length=a.length}17&t&&w(n,e[0])},i:e,o:e,d(e){e&&m(n),f(c,e),o=!1,r()}}}function Le(e){let t,n,o,r,a,c,l;return t=new de({props:{icon:"plus"}}),t.$on("click",e[11]),c=new de({props:{icon:"minus"}}),c.$on("click",e[12]),{c(){W(t.$$.fragment),n=g(),o=p("span"),r=$(e[0]),a=g(),W(c.$$.fragment),v(o,"class","number")},m(e,i){Z(t,e,i),u(e,n,i),u(e,o,i),s(o,r),u(e,a,i),Z(c,e,i),l=!0},p(e,t){(!l||1&t)&&b(r,e[0])},i(e){l||(P(t.$$.fragment,e),P(c.$$.fragment,e),l=!0)},o(e){U(t.$$.fragment,e),U(c.$$.fragment,e),l=!1},d(e){G(t,e),e&&m(n),e&&m(o),e&&m(a),G(c,e)}}}function xe(e){let t,n;return t=new de({props:{icon:e[0]?"check":"nocheck",text:e[1]}}),t.$on("click",e[10]),{c(){W(t.$$.fragment)},m(e,o){Z(t,e,o),n=!0},p(e,n){const o={};1&n&&(o.icon=e[0]?"check":"nocheck"),2&n&&(o.text=e[1]),t.$set(o)},i(e){n||(P(t.$$.fragment,e),n=!0)},o(e){U(t.$$.fragment,e),n=!1},d(e){G(t,e)}}}function Se(e){let t,n;return t=new de({props:{icon:e[0]>=e[21]?"star":"nostar"}}),t.$on("click",(function(){return e[15](e[21])})),{c(){W(t.$$.fragment)},m(e,o){Z(t,e,o),n=!0},p(n,o){e=n;const r={};1&o&&(r.icon=e[0]>=e[21]?"star":"nostar"),t.$set(r)},i(e){n||(P(t.$$.fragment,e),n=!0)},o(e){U(t.$$.fragment,e),n=!1},d(e){G(t,e)}}}function Me(e){let t,n,o,r=e[18]+"";return{c(){t=p("option"),n=$(r),t.__value=o=e[18],t.value=t.__value},m(e,o){u(e,t,o),s(t,n)},p(e,a){16&a&&r!==(r=e[18]+"")&&b(n,r),16&a&&o!==(o=e[18])&&(t.__value=o,t.value=t.__value)},d(e){e&&m(t)}}}function _e(e){let t,n,o,r,a,c,l,i=e[3]&&he(e),f="toggle"!=e[2]&&ve(e);const d=[xe,Le,we,ye,be,Ce],$=[];function h(e,t){return"toggle"==e[2]?0:"number"==e[2]?1:"select"==e[2]?2:"text"==e[2]?3:"rating"==e[2]?4:"timer"==e[2]?5:-1}return~(a=h(e))&&(c=$[a]=d[a](e)),{c(){i&&i.c(),t=g(),n=p("div"),f&&f.c(),o=g(),r=p("div"),c&&c.c(),v(r,"class","flex"),L(n,"max-width","text"==e[2])},m(e,c){i&&i.m(e,c),u(e,t,c),u(e,n,c),f&&f.m(n,null),s(n,o),s(n,r),~a&&$[a].m(r,null),l=!0},p(e,[l]){e[3]?i?i.p(e,l):(i=he(e),i.c(),i.m(t.parentNode,t)):i&&(i.d(1),i=null),"toggle"!=e[2]?f?f.p(e,l):(f=ve(e),f.c(),f.m(n,o)):f&&(f.d(1),f=null);let s=a;a=h(e),a===s?~a&&$[a].p(e,l):(c&&(R(),U($[s],1,1,(()=>{$[s]=null})),F()),~a?(c=$[a],c?c.p(e,l):(c=$[a]=d[a](e),c.c()),P(c,1),c.m(r,null)):c=null),4&l&&L(n,"max-width","text"==e[2])},i(e){l||(P(c),l=!0)},o(e){U(c),l=!1},d(e){i&&i.d(e),e&&m(t),e&&m(n),f&&f.d(),~a&&$[a].d()}}}function ke(e,t,n){const o=M();let r,{name:a=""}=t,{type:c=""}=t,{value:l=null}=t,{group:i=""}=t,{values:s=[]}=t,{tip:u=""}=t,m=!1;function f(){n(6,m=!1),clearInterval(r)}return e.$$set=e=>{"name"in e&&n(1,a=e.name),"type"in e&&n(2,c=e.type),"value"in e&&n(0,l=e.value),"group"in e&&n(3,i=e.group),"values"in e&&n(4,s=e.values),"tip"in e&&n(5,u=e.tip)},e.$$.update=()=>{1&e.$$.dirty&&o("update")},[l,a,c,i,s,u,m,function(){n(6,m=!0),r=setInterval((()=>{m&&n(0,l=(parseFloat(l)+.1).toFixed(1))}),100)},f,function(){"timer"==c&&(m&&f(),n(0,l=0))},()=>n(0,l=!l),()=>n(0,l++,l),()=>n(0,l--,l),function(){l=function(e){const t=e.querySelector(":checked")||e.options[0];return t&&t.__value}(this),n(0,l),n(4,s)},function(){l=this.value,n(0,l),n(4,s)},e=>n(0,l=e)]}class ze extends X{constructor(e){super(),Q(this,e,ke,_e,c,{name:1,type:2,value:0,group:3,values:4,tip:5})}}function Ve(t){let n,o,r,a,c,l;return r=new de({props:{icon:"copy",text:"Copy"}}),r.$on("click",t[0]),c=new de({props:{icon:"pen",text:"Edit"}}),c.$on("click",t[1]),{c(){n=p("span"),n.textContent="Template",o=g(),W(r.$$.fragment),a=g(),W(c.$$.fragment),v(n,"class","group")},m(e,t){u(e,n,t),u(e,o,t),Z(r,e,t),u(e,a,t),Z(c,e,t),l=!0},p:e,i(e){l||(P(r.$$.fragment,e),P(c.$$.fragment,e),l=!0)},o(e){U(r.$$.fragment,e),U(c.$$.fragment,e),l=!1},d(e){e&&m(n),e&&m(o),G(r,e),e&&m(a),G(c,e)}}}function Ae(e,t,n){let o;function r(e){i(ne,o.template=JSON.parse(JSON.stringify(null!=e?e:oe)),o),localStorage.setItem("template",JSON.stringify(o.template)),localStorage.removeItem("backup"),i(ne,o.metrics=o.template.metrics.map((e=>{let t=ae(e.type);return"select"==e.type&&(t=e.values[0]),Object.assign(Object.assign({},e),{value:t,default:t})})),o)}return l(e,ne,(e=>n(2,o=e))),[function(){let e=JSON.stringify(o.template);"clipboard"in navigator?(navigator.clipboard.writeText(e),alert("Copied template")):prompt("Copy the template below",e)},function(){const e=prompt("Paste new template (you can also 'reset'):");if(e)if("reset"==e)r(),localStorage.removeItem("template");else{let t=function(e){var t;let n={template:null,error:""};try{n.template=JSON.parse(e)}catch(e){return n.error=e,n}return Array.isArray(null!==(t=n.template.teams)&&void 0!==t?t:[])||(n.error+="Template has invalid teams"),n.template.metrics?n.template.metrics.forEach(((e,t)=>{var o,r,a;e.name||(n.error+=`\nMetric ${t+1} has no name`),"select"!=e.type||Array.isArray(null!==(o=e.values)&&void 0!==o?o:[])||(n.error+=`\nMetric ${null!==(r=e.name)&&void 0!==r?r:t+1} has invalid values`),re.some((t=>t.name==e.type))||(n.error+=`\nMetric ${null!==(a=e.name)&&void 0!==a?a:t+1} has invalid type`)})):n.error+="\nTemplate has no metrics",n}(e);t.error?alert(`Could not set template! ${t.error}`):r(t.template)}}]}class He extends X{constructor(e){super(),Q(this,e,Ae,Ve,c,{})}}function Ee(e){let t,n,o,r,a,c,l,i,s;function f(t){e[2](t)}let d={name:"Type",type:"select",values:Object.values(ee)};return void 0!==e[0]&&(d.value=e[0]),o=new ze({props:d}),z.push((()=>D(o,"value",f))),c=new de({props:{icon:"download",text:"Download"}}),c.$on("click",e[1]),i=new de({props:{icon:"erase",text:"Erase"}}),i.$on("click",Oe),{c(){t=p("span"),t.textContent="Surveys",n=g(),W(o.$$.fragment),a=g(),W(c.$$.fragment),l=g(),W(i.$$.fragment),v(t,"class","group")},m(e,r){u(e,t,r),u(e,n,r),Z(o,e,r),u(e,a,r),Z(c,e,r),u(e,l,r),Z(i,e,r),s=!0},p(e,[t]){const n={};!r&&1&t&&(r=!0,n.value=e[0],N((()=>r=!1))),o.$set(n)},i(e){s||(P(o.$$.fragment,e),P(c.$$.fragment,e),P(i.$$.fragment,e),s=!0)},o(e){U(o.$$.fragment,e),U(c.$$.fragment,e),U(i.$$.fragment,e),s=!1},d(e){e&&m(t),e&&m(n),G(o,e),e&&m(a),G(c,e),e&&m(l),G(i,e)}}}function Oe(){"erase"==prompt("Type 'erase' to erase saved surveys")&&localStorage.removeItem("surveys")}function Ne(e,t,n){let o="CSV";return[o,function(){confirm("Confirm download?")&&function(){let e=localStorage.getItem("surveys");if(e){const t=document.createElement("a");t.href="data:text/plain;charset=utf-8,","CSV"==o?t.href+=encodeURIComponent(function(e){let t="";return e&&e.forEach((e=>{let n="";e.forEach((e=>{"string"==typeof e.value?n+='"'+e.value+'",':n+=e.value+","})),t+=n+"\n"})),t}(JSON.parse(e))):"JSON"==o&&(t.href+=encodeURIComponent(e)),t.download=`surveys.${o.toLowerCase()}`,document.body.append(t),t.click(),t.remove()}}()},function(e){o=e,n(0,o)}]}class Ie extends X{constructor(e){super(),Q(this,e,Ne,Ee,c,{})}}function Te(e){let t,n,o,r,a,c,l,i,f,d,$,C;function b(t){e[3](t)}let y={name:"Location",type:"select",values:Object.values(te)};return void 0!==e[0].location&&(y.value=e[0].location),r=new ze({props:y}),z.push((()=>D(r,"value",b))),r.$on("update",e[1]),l=new He({}),f=new Ie({}),{c(){t=p("div"),n=p("span"),n.textContent="Options",o=g(),W(r.$$.fragment),c=g(),W(l.$$.fragment),i=g(),W(f.$$.fragment),v(n,"class","group"),v(t,"class","flex spaced bg extend-bg"),v(t,"id","menu"),L(t,"hide",!e[0].menuVisible)},m(a,m){u(a,t,m),s(t,n),s(t,o),Z(r,t,null),s(t,c),Z(l,t,null),s(t,i),Z(f,t,null),d=!0,$||(C=h(window,"load",e[2]),$=!0)},p(e,[n]){const o={};!a&&1&n&&(a=!0,o.value=e[0].location,N((()=>a=!1))),r.$set(o),1&n&&L(t,"hide",!e[0].menuVisible)},i(e){d||(P(r.$$.fragment,e),P(l.$$.fragment,e),P(f.$$.fragment,e),d=!0)},o(e){U(r.$$.fragment,e),U(l.$$.fragment,e),U(f.$$.fragment,e),d=!1},d(e){e&&m(t),G(r),G(l),G(f),$=!1,C()}}}function Je(e,t,n){let o;function r(){localStorage.setItem("location",o.location);let e="";o.location.toLowerCase().includes("red")?e="red":o.location.toLowerCase().includes("blue")&&(e="blue"),document.documentElement.style.setProperty("--theme-color",`var(--${e})`)}return l(e,ne,(e=>n(0,o=e))),[o,r,function(){let e=localStorage.getItem("location");te.some((t=>t==e))&&(i(ne,o.location=e,o),r())},function(t){e.$$.not_equal(o.location,t)&&(o.location=t,ne.set(o))}]}class je extends X{constructor(e){super(),Q(this,e,Je,Te,c,{})}}function qe(e,t,n){const o=e.slice();return o[7]=t[n],o}function Be(e){let t,n;return{c(){t=p("option"),t.__value=n=e[7],t.value=t.__value},m(e,n){u(e,t,n)},p(e,o){1&o&&n!==(n=e[7])&&(t.__value=n,t.value=t.__value)},d(e){e&&m(t)}}}function Re(e){let t,n,o,a,c,l,i,d,b,w,L,x,S,M,_,k,V,A,H=e[0].template?.teams??[],E=[];for(let t=0;t<H.length;t+=1)E[t]=Be(qe(e,H,t));function O(t){e[5](t)}let I={name:"Absent",type:"toggle"};return void 0!==e[0].isAbsent&&(I.value=e[0].isAbsent),M=new ze({props:I}),z.push((()=>D(M,"value",O))),M.$on("update",e[6]),{c(){t=p("div"),n=p("span"),n.textContent="Info",o=g(),a=p("div"),c=$("Team\r\n    "),l=p("input"),i=g(),d=p("datalist");for(let e=0;e<E.length;e+=1)E[e].c();b=g(),w=p("div"),L=$("Match\r\n    "),x=p("input"),S=g(),W(M.$$.fragment),v(n,"class","group"),v(l,"id","metric-team"),v(l,"list","teams-list"),v(l,"maxlength","5"),v(d,"id","teams-list"),v(x,"id","metric-match"),v(x,"type","number"),v(x,"pattern","[0-9]*"),v(t,"class","flex spaced")},m(r,m){u(r,t,m),s(t,n),s(t,o),s(t,a),s(a,c),s(a,l),y(l,e[0].team),s(a,i),s(a,d);for(let e=0;e<E.length;e+=1)E[e].m(d,null);s(t,b),s(t,w),s(w,L),s(w,x),y(x,e[0].match),s(t,S),Z(M,t,null),k=!0,V||(A=[h(l,"input",e[1]),h(l,"change",e[2]),h(x,"input",e[3]),h(x,"change",e[4])],V=!0)},p(e,[t]){if(1&t&&l.value!==e[0].team&&y(l,e[0].team),1&t){let n;for(H=e[0].template?.teams??[],n=0;n<H.length;n+=1){const o=qe(e,H,n);E[n]?E[n].p(o,t):(E[n]=Be(o),E[n].c(),E[n].m(d,null))}for(;n<E.length;n+=1)E[n].d(1);E.length=H.length}1&t&&C(x.value)!==e[0].match&&y(x,e[0].match);const n={};!_&&1&t&&(_=!0,n.value=e[0].isAbsent,N((()=>_=!1))),M.$set(n)},i(e){k||(P(M.$$.fragment,e),k=!0)},o(e){U(M.$$.fragment,e),k=!1},d(e){e&&m(t),f(E,e),G(M),V=!1,r(A)}}}function Fe(e,t,n){let o;l(e,ne,(e=>n(0,o=e)));return[o,function(){o.team=this.value,ne.set(o)},()=>le(o),function(){o.match=C(this.value),ne.set(o)},()=>le(o),function(t){e.$$.not_equal(o.isAbsent,t)&&(o.isAbsent=t,ne.set(o))},()=>le(o)]}class Pe extends X{constructor(e){super(),Q(this,e,Fe,Re,c,{})}}function Ue(e,t,n){const o=e.slice();return o[4]=t[n],o[5]=t,o[6]=n,o}function De(e){let n,o,r,a;const c=[e[4]];function l(t){e[1](t,e[6])}function i(t){e[2](t,e[6])}let s={};for(let e=0;e<c.length;e+=1)s=t(s,c[e]);return void 0!==e[0].metrics[e[6]].name&&(s.name=e[0].metrics[e[6]].name),void 0!==e[0].metrics[e[6]].value&&(s.value=e[0].metrics[e[6]].value),n=new ze({props:s}),z.push((()=>D(n,"name",l))),z.push((()=>D(n,"value",i))),n.$on("update",e[3]),{c(){W(n.$$.fragment)},m(e,t){Z(n,e,t),a=!0},p(t,a){e=t;const l=1&a?function(e,t){const n={},o={},r={$$scope:1};let a=e.length;for(;a--;){const c=e[a],l=t[a];if(l){for(const e in c)e in l||(o[e]=1);for(const e in l)r[e]||(n[e]=l[e],r[e]=1);e[a]=l}else for(const e in c)r[e]=1}for(const e in o)e in n||(n[e]=void 0);return n}(c,[(i=e[4],"object"==typeof i&&null!==i?i:{})]):{};var i;!o&&1&a&&(o=!0,l.name=e[0].metrics[e[6]].name,N((()=>o=!1))),!r&&1&a&&(r=!0,l.value=e[0].metrics[e[6]].value,N((()=>r=!1))),n.$set(l)},i(e){a||(P(n.$$.fragment,e),a=!0)},o(e){U(n.$$.fragment,e),a=!1},d(e){G(n,e)}}}function We(e){let t,n,o=e[0].template?.metrics??[],r=[];for(let t=0;t<o.length;t+=1)r[t]=De(Ue(e,o,t));const a=e=>U(r[e],1,1,(()=>{r[e]=null}));return{c(){t=p("div");for(let e=0;e<r.length;e+=1)r[e].c();v(t,"class","flex spaced"),L(t,"hide",e[0].isAbsent)},m(e,o){u(e,t,o);for(let e=0;e<r.length;e+=1)r[e].m(t,null);n=!0},p(e,[n]){if(1&n){let c;for(o=e[0].template?.metrics??[],c=0;c<o.length;c+=1){const a=Ue(e,o,c);r[c]?(r[c].p(a,n),P(r[c],1)):(r[c]=De(a),r[c].c(),P(r[c],1),r[c].m(t,null))}for(R(),c=o.length;c<r.length;c+=1)a(c);F()}1&n&&L(t,"hide",e[0].isAbsent)},i(e){if(!n){for(let e=0;e<o.length;e+=1)P(r[e]);n=!0}},o(e){r=r.filter(Boolean);for(let e=0;e<r.length;e+=1)U(r[e]);n=!1},d(e){e&&m(t),f(r,e)}}}function Ze(e,t,n){let o;l(e,ne,(e=>n(0,o=e)));return[o,function(t,n){e.$$.not_equal(o.metrics[n].name,t)&&(o.metrics[n].name=t,ne.set(o))},function(t,n){e.$$.not_equal(o.metrics[n].value,t)&&(o.metrics[n].value=t,ne.set(o))},()=>le(o)]}class Ge extends X{constructor(e){super(),Q(this,e,Ze,We,c,{})}}function Ke(t){let n,o,r,a,c;return o=new de({props:{icon:"save",text:"Save"}}),o.$on("click",t[0]),a=new de({props:{icon:"reset",text:"Reset"}}),a.$on("click",t[1]),{c(){n=p("div"),W(o.$$.fragment),r=g(),W(a.$$.fragment),v(n,"class","flex space-between spaced bg extend-bg extend-down")},m(e,t){u(e,n,t),Z(o,n,null),s(n,r),Z(a,n,null),c=!0},p:e,i(e){c||(P(o.$$.fragment,e),P(a.$$.fragment,e),c=!0)},o(e){U(o.$$.fragment,e),U(a.$$.fragment,e),c=!1},d(e){e&&m(n),G(o),G(a)}}}function Qe(e,t,n){let o;function r(){i(ne,o.team="",o),i(ne,o.isAbsent=!1,o),o.metrics.forEach((e=>e.value=e.default))}return l(e,ne,(e=>n(2,o=e))),[function(){var e;let t=/^\d{1,4}[A-Z]?$/.test(o.team)?o.template.teams&&!o.template.teams.some((e=>e==o.team))?"Team value not whitelisted":/\d{1,3}/.test(`${o.match}`)?"":"Invalid match value":"Invalid team value";if(t)alert(`Could not save survey! ${t}`);else if(confirm("Confirm save?")){let t=JSON.stringify([...JSON.parse(null!==(e=localStorage.getItem("surveys"))&&void 0!==e?e:"[]"),ce(o)]);localStorage.setItem("surveys",t),r(),i(ne,o.match++,o)}},function(){"reset"==prompt("Type 'reset' to reset the survey")&&r()}]}class Xe extends X{constructor(e){super(),Q(this,e,Qe,Ke,c,{})}}function Ye(t){let n,o,r,a,c,l,i,s,f,p,d,$;return n=new me({}),r=new je({}),c=new Pe({}),i=new Ge({}),f=new Xe({}),{c(){W(n.$$.fragment),o=g(),W(r.$$.fragment),a=g(),W(c.$$.fragment),l=g(),W(i.$$.fragment),s=g(),W(f.$$.fragment)},m(e,m){Z(n,e,m),u(e,o,m),Z(r,e,m),u(e,a,m),Z(c,e,m),u(e,l,m),Z(i,e,m),u(e,s,m),Z(f,e,m),p=!0,d||($=h(window,"load",t[0]),d=!0)},p:e,i(e){p||(P(n.$$.fragment,e),P(r.$$.fragment,e),P(c.$$.fragment,e),P(i.$$.fragment,e),P(f.$$.fragment,e),p=!0)},o(e){U(n.$$.fragment,e),U(r.$$.fragment,e),U(c.$$.fragment,e),U(i.$$.fragment,e),U(f.$$.fragment,e),p=!1},d(e){G(n,e),e&&m(o),G(r,e),e&&m(a),G(c,e),e&&m(l),G(i,e),e&&m(s),G(f,e),d=!1,$()}}}function et(e,t,n){let o;return l(e,ne,(e=>n(1,o=e))),[function(){if("serviceWorker"in navigator)try{navigator.serviceWorker.register("./sw.js")}catch(e){console.log(e)}var e;i(ne,o.template=JSON.parse(null!==(e=localStorage.getItem("template"))&&void 0!==e?e:JSON.stringify(oe)),o),i(ne,o.metrics=o.template.metrics.map((e=>{let t=ae(e.type);return"select"==e.type&&(t=e.values[0]),Object.assign(Object.assign({},e),{value:t,default:t})})),o),function(){const e=JSON.parse(localStorage.getItem("backup"));e&&(i(ne,o.team=e.find((e=>"Team"==e.name)).value,o),i(ne,o.match=e.find((e=>"Match"==e.name)).value,o),i(ne,o.isAbsent=e.find((e=>"Absent"==e.name)).value,o),o.metrics.forEach(((t,n)=>t.value=e[n+3].value)))}(),document.body.classList.remove("hide")}]}return new class extends X{constructor(e){super(),Q(this,e,et,Ye,c,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
