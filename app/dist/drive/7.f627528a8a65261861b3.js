(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{"99Un":function(t,n,e){"use strict";e.r(n),e.d(n,"HomePageModule",function(){return h});var c=e("AytR"),o=e("fXoL"),i=e("jhN1"),s=e("L7HW"),a=e("IRyT"),r=e("4jEk"),b=e("bTqV");let u=(()=>{class t{constructor(t,n,e){this.title=t,this.config=n,this.account=e,this.icon=c.a.icon,this.name=c.a.appName,this.observers={}}ngOnInit(){this.observers.loaded=this.config.loaded.subscribe(t=>{t&&(this.title.setTitle([c.a.appName,"Home"].join(" | ")),this.icon=c.a.icon,this.name=c.a.appName)})}ngOnDestroy(){this.observers.loaded.unsubscribe()}}return t.\u0275fac=function(n){return new(n||t)(o.Mb(i.d),o.Mb(s.a),o.Mb(a.a))},t.\u0275cmp=o.Gb({type:t,selectors:[["home-page"]],decls:8,vars:2,consts:[["alt","icon","width","152","height","152","draggable","false",3,"src"],["mat-stroked-button","",3,"click"]],template:function(t,n){1&t&&(o.Pb(0,"mat-content"),o.Nb(1,"img",0),o.Pb(2,"h1"),o.lc(3),o.Ob(),o.Pb(4,"button",1),o.Wb("click",function(){return n.account.signin()}),o.lc(5," Sign In "),o.Ob(),o.Pb(6,"button",1),o.Wb("click",function(){return n.account.signup()}),o.lc(7," Sign Up "),o.Ob(),o.Ob()),2&t&&(o.Cb(1),o.cc("src",n.icon,o.fc),o.Cb(2),o.nc(" ",n.name," "))},directives:[r.a,b.a],styles:["button[_ngcontent-%COMP%]{width:100%;max-width:400px;margin-bottom:20px}mat-content[_ngcontent-%COMP%]{display:flex;align-items:center;flex-direction:column;justify-content:center}mat-content[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%], mat-content[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{margin-bottom:20px!important}"]}),t})();var l=e("ofXK"),m=e("H0Zp"),p=e("tyNb");const g=[{path:"",component:u}];let h=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=o.Kb({type:t}),t.\u0275inj=o.Jb({imports:[[l.b,b.b,m.a,p.c.forChild(g)]]}),t})()}}]);