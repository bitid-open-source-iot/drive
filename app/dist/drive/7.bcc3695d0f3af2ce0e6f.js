(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{"99Un":function(t,n,e){"use strict";e.r(n),e.d(n,"HomePageModule",function(){return h});var c=e("AytR"),o=e("fXoL"),i=e("jhN1"),s=e("L7HW"),a=e("IRyT"),r=e("4jEk"),b=e("bTqV");let u=(()=>{class t{constructor(t,n,e){this.title=t,this.config=n,this.account=e,this.icon=c.a.icon,this.name=c.a.appName,this.observers={}}ngOnInit(){this.observers.loaded=this.config.loaded.subscribe(t=>{t&&(this.title.setTitle([c.a.appName,"Home"].join(" | ")),this.icon=c.a.icon,this.name=c.a.appName)})}ngOnDestroy(){this.observers.loaded.unsubscribe()}}return t.\u0275fac=function(n){return new(n||t)(o.Ob(i.d),o.Ob(s.a),o.Ob(a.a))},t.\u0275cmp=o.Ib({type:t,selectors:[["home-page"]],decls:8,vars:2,consts:[["alt","icon","width","152","height","152","draggable","false",3,"src"],["mat-stroked-button","",3,"click"]],template:function(t,n){1&t&&(o.Ub(0,"mat-content"),o.Pb(1,"img",0),o.Ub(2,"h1"),o.xc(3),o.Tb(),o.Ub(4,"button",1),o.bc("click",function(){return n.account.signin()}),o.xc(5," Sign In "),o.Tb(),o.Ub(6,"button",1),o.bc("click",function(){return n.account.signup()}),o.xc(7," Sign Up "),o.Tb(),o.Tb()),2&t&&(o.Db(1),o.lc("src",n.icon,o.rc),o.Db(2),o.zc(" ",n.name," "))},directives:[r.a,b.a],styles:["button[_ngcontent-%COMP%]{width:100%;max-width:400px;margin-bottom:20px}mat-content[_ngcontent-%COMP%]{display:flex;align-items:center;flex-direction:column;justify-content:center}mat-content[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%], mat-content[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{margin-bottom:20px!important}"]}),t})();var m=e("ofXK"),l=e("H0Zp"),p=e("tyNb");const g=[{path:"",component:u}];let h=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=o.Mb({type:t}),t.\u0275inj=o.Lb({imports:[[m.c,b.b,l.a,p.e.forChild(g)]]}),t})()}}]);