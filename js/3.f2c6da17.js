(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[3],{"3ad4":function(e,t,s){"use strict";s("e501")},"5a50":function(e,t,s){"use strict";s.d(t,"b",(function(){return n})),s.d(t,"l",(function(){return o})),s.d(t,"m",(function(){return l})),s.d(t,"c",(function(){return i})),s.d(t,"a",(function(){return r})),s.d(t,"d",(function(){return a})),s.d(t,"i",(function(){return c})),s.d(t,"h",(function(){return d})),s.d(t,"j",(function(){return u})),s.d(t,"k",(function(){return h})),s.d(t,"e",(function(){return p})),s.d(t,"g",(function(){return m})),s.d(t,"f",(function(){return g})),s.d(t,"t",(function(){return v})),s.d(t,"p",(function(){return b})),s.d(t,"n",(function(){return f})),s.d(t,"s",(function(){return y})),s.d(t,"r",(function(){return S})),s.d(t,"q",(function(){return q})),s.d(t,"o",(function(){return C}));const n="mqtt-tiles-boards",i="mqtt-tiles-clients",r="mqtt-tiles-active-client",a="mqtt-tiles-show-ping",o=0,l=1,c=0,d=1,u=0,h=1,p=0,m=1,g=2,v=0,b=1,f=2,y=3,S=4,q=5,C=6},9224:function(e){e.exports=JSON.parse('{"a":"1.16.10"}')},a11b:function(e,t,s){"use strict";s.d(t,"a",(function(){return i})),s.d(t,"b",(function(){return r}));var n=s("9224");const i=()=>({clientName:"New client",clientId:`mqtt-tiles-${n["a"]}-${Math.random().toString(16).substring(2,10)}`,host:"wss://mqtt.flespi.io",keepalive:60,protocolVersion:5,clean:!0,username:"FlespiToken XXXXXXXXXXXXXXXXXXX",password:"",properties:{sessionExpiryInterval:void 0},subscribeWithTokenCid:!0,uniqueClientId:!0,syncNamespace:"xflespifront/mqtttiles/boards"}),r=(e={})=>({topicTemplate:"",topicFilter:"",payloadType:0,payloadField:"",payloadNameField:"",default:"",...e})},e501:function(e,t,s){},f241:function(e,t,s){"use strict";s.r(t);var n=function(){var e=this,t=e._self._c;return t("q-layout",{attrs:{view:"hHh Lpr lFf"}},[t("client-settings",{attrs:{settings:e.currentSettings},on:{save:e.saveSettingsHandler,hide:e.hideSettingsHandler},model:{value:e.clientSettingsOpened,callback:function(t){e.clientSettingsOpened=t},expression:"clientSettingsOpened"}}),e.fullViewMode?t("q-header",[t("q-toolbar",{class:[`bg-${e.$theme}-9`]},[t("q-toolbar-title",{staticStyle:{"line-height":"36px"}},[t("img",{staticStyle:{height:"30px","vertical-align":"text-bottom"},attrs:{src:"mqtttiles-logo.png",alt:"MQTT Tiles"}}),e._v("\n        MQTT Tiles\n        "),t("sup",{staticStyle:{position:"relative","font-size":".9rem","padding-left":"4px"}},[e._v(e._s(e.version))])]),e.fullViewMode&&!e.$integrationMode?t("q-btn",{attrs:{flat:"",icon:e.connected?"mdi-lan-connect":"mdi-lan-disconnect",color:e.connected?"green":"red"}},[e.activeClientId?t("div",{staticClass:"q-ml-sm"},[t("div",{staticStyle:{"line-height":"0.8rem"}},[e._v(e._s(e.clients[e.activeClientId].clientName))]),t("div",{class:[`text-${e.connected?"green":"red"} text-overline`],staticStyle:{"font-size":"0.6rem","line-height":"0.7rem"}},[e._v(e._s(e.connected?"Online":"Offline"))]),e.showping&&e.pingtime?t("div",{staticStyle:{"font-size":"0.6rem","line-height":"0.6rem"}},[e._v("Ping: "+e._s(e.pingtime)+" ms.")]):e._e()]):t("div",{staticClass:"q-ml-sm"},[e._v("Connect")]),t("q-tooltip",[e._v("Connections")]),t("q-menu",{attrs:{persistent:!0,offset:[0,5]},on:{hide:function(t){e.isConnectionsOpened=!1},show:function(t){e.isConnectionsOpened=!0}}},[t("div",{staticStyle:{"min-width":"300px"},style:{minHeight:e.clientsIds.length?"300px":"200px"}},[t("div",{staticClass:"connections__subheader q-px-md",class:[`bg-${e.$theme}-9`],staticStyle:{position:"relative",height:"70px"}},[t("span",{staticClass:"text-white",staticStyle:{"font-size":"1.4rem","line-height":"70px"}},[e._v("My connections")]),t("q-btn",{staticClass:"text-white",staticStyle:{position:"absolute",bottom:"-20px",right:"16px","z-index":"1"},attrs:{"fab-mini":"",icon:"mdi-plus",color:`${e.$theme}-7`},on:{click:e.openSettings}})],1),e.clientsIds.length?t("q-list",{staticClass:"scroll",class:[`bg-${e.$theme}-1`],staticStyle:{height:"200px"}},[t("q-item-label",{staticClass:"q-py-md q-pl-md text-grey-9"},[t("span",[e._v("Connections")])]),e._l(e.clients,(function(s,n){return t("q-item",{key:n,attrs:{clickable:"",active:n===e.activeClientId},on:{click:function(t){return e.editClientSettings(n)}}},[t("q-item-section",{attrs:{avatar:""}},[e.connected&&n===e.activeClientId?t("q-btn",{attrs:{color:"green",icon:"mdi-lan-connect",dense:"",flat:""},on:{click:function(t){return t.stopPropagation(),e.setActiveClient()}}},[t("q-tooltip",[e._v("Disconnect")])],1):t("q-btn",{attrs:{icon:"mdi-lan-disconnect",color:n===e.activeClientId?"red":"",dense:"",flat:""},on:{click:function(t){return t.stopPropagation(),e.setActiveClient(n)}}},[n===e.activeClientId?t("q-tooltip",[e._v("Active")]):e._e()],1)],1),t("q-item-section",[t("q-item-label",{class:{[`text-${e.connected?"green":"red"}-6`]:n===e.activeClientId}},[t("div",{staticStyle:{"max-width":"calc(100% - 25px)",display:"inline-flex"}},[t("div",{staticClass:"ellipsis"},[e._v(e._s(s.clientName))])]),t("div",{staticStyle:{display:"inline-flex"}},[s.attachedBoards&&s.attachedBoards.length?t("q-icon",{staticClass:"q-ml-xs",attrs:{name:"mdi-link-variant",flat:"",dense:"",size:"15px",color:"yellow-9"}},[t("q-tooltip",[e._v("\n                          "+e._s(`Attached boards: ${s.attachedBoards.join(", ")}`)+"\n                        ")])],1):e._e()],1)]),t("q-item-label",{staticClass:"ellipsis",attrs:{caption:""}},[e._v(e._s(s.host))])],1),t("q-item-section",{staticStyle:{"padding-left":"4px!important"},attrs:{side:""}},[t("q-btn",{attrs:{round:"",flat:"",dense:"",icon:"mdi-dots-vertical"},on:{click:function(e){e.stopPropagation()}}},[t("q-menu",{attrs:{anchor:"bottom right",self:"top right"}},[t("q-list",{class:[`bg-${e.$theme}-1`]},[t("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],class:n===e.activeClientId?"text-red":"",attrs:{clickable:""},on:{click:function(t){n===e.activeClientId?e.setActiveClient():e.setActiveClient(n)}}},[t("q-item-section",{attrs:{avatar:""}},[t("q-icon",{attrs:{name:n===e.activeClientId?"mdi-lan-disconnect":"mdi-lan-connect"}})],1),t("q-item-section",[e._v(e._s(n===e.activeClientId?"Disconnect":"Connect"))])],1),t("q-separator"),t("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:""},on:{click:function(t){return e.editClientSettings(n)}}},[t("q-item-section",{attrs:{avatar:""}},[t("q-icon",{attrs:{name:"mdi-cog"}})],1),t("q-item-section",[e._v("Edit")])],1),t("q-separator"),t("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:""},on:{click:function(t){return e.removeClient(n)}}},[t("q-item-section",{attrs:{avatar:""}},[t("q-icon",{attrs:{name:"mdi-delete-outline",color:"red"}})],1),t("q-item-section",[e._v("Remove")])],1)],1)],1)],1)],1)],1)}))],2):t("div",{staticClass:"q-px-md q-pt-lg text-center"},[t("div",{staticClass:"text-bold"},[e._v("No connections")]),t("div",{staticStyle:{"font-size":".8rem"}},[e._v("Create a connection to visualize its data on boards")])]),t("div",{staticClass:"bg-grey-4"},[t("q-toggle",{staticClass:"q-ml-md",attrs:{label:"Show ping",color:"grey-9"},model:{value:e.showping,callback:function(t){e.showping=t},expression:"showping"}})],1)],1)])],1):e._e()],1)],1):e._e(),t("q-page-container",[t("router-view",{attrs:{client:e.clients[e.activeClientId]},on:{"change-status":e.changeStatus,ping:e.ping,share:e.shareHandler,"change:attach":e.changeAttachedBoards,"delete:boards":e.deleteBoardsHandler,"add:boards":e.addBoardsHandler,"update-client-settings":function(t){return e.editClientSettings(e.activeClientId)}}})],1)],1)},i=[],r=(s("14d9"),function(){var e=this,t=e._self._c;return t("q-dialog",{attrs:{maximized:e.$q.screen.lt.md},on:{hide:e.closeHandler},model:{value:e.status,callback:function(t){e.status=t},expression:"status"}},[t("div",{style:{width:e.$q.screen.lt.md?"100%":"50vw"}},[t("q-toolbar",{staticClass:"text-white",class:[`bg-${e.$theme}-9`]},[t("q-toolbar-title",[e._v("\n        MQTT client\n      ")])],1),t("div",{staticClass:"q-pa-md scroll",class:[`bg-${e.$theme}-1`],style:{height:e.$q.screen.lt.md?"calc(100% - 100px)":"50vh"}},[t("q-input",{attrs:{color:"grey-9 q-mb-sm",outlined:"","hide-bottom-space":"",dense:"",label:"MQTT client name",error:!e.currentSettings.clientName},model:{value:e.currentSettings.clientName,callback:function(t){e.$set(e.currentSettings,"clientName",t)},expression:"currentSettings.clientName"}}),t("q-input",{attrs:{color:"grey-9 q-mb-sm",outlined:"","hide-bottom-space":"",dense:"",label:"Client ID",error:!e.currentSettings.clientId},model:{value:e.currentSettings.clientId,callback:function(t){e.$set(e.currentSettings,"clientId",t)},expression:"currentSettings.clientId"}},[t("q-btn",{attrs:{slot:"append",flat:"",dense:"",icon:"mdi-refresh"},on:{click:function(t){e.currentSettings.clientId=`mqtt-tiles-${e.version}-${Math.random().toString(16).substring(2,8)}`}},slot:"append"})],1),t("q-toggle",{attrs:{label:"Force unique Client ID"},model:{value:e.currentSettings.uniqueClientId,callback:function(t){e.$set(e.currentSettings,"uniqueClientId",t)},expression:"currentSettings.uniqueClientId"}}),t("q-input",{attrs:{color:"grey-9 q-mb-sm",outlined:"","hide-bottom-space":"",dense:"",label:"Host",error:!e.currentSettings.host||0===e.currentSettings.host.indexOf("ws:")},model:{value:e.currentSettings.host,callback:function(t){e.$set(e.currentSettings,"host",t)},expression:"currentSettings.host"}},[e.currentSettings.host&&0!==e.currentSettings.host.indexOf("ws:")?e._e():t("q-btn",{attrs:{slot:"append",flat:"",dense:"",icon:"mdi-alert-outline"},on:{click:e.hostErrorHandler},slot:"append"})],1),t("q-input",{attrs:{color:"grey-9 q-mb-sm",outlined:"","hide-bottom-space":"",dense:"",type:"number",label:"Keep alive"},model:{value:e.currentSettings.keepalive,callback:function(t){e.$set(e.currentSettings,"keepalive",e._n(t))},expression:"currentSettings.keepalive"}}),t("q-select",{attrs:{color:"grey-9 q-mb-sm",outlined:"",dense:"","hide-bottom-space":"","emit-value":"","map-options":"",options:[{label:"3.1.1",value:4},{label:"5.0",value:5}],label:"Version of MQTT"},model:{value:e.currentSettings.protocolVersion,callback:function(t){e.$set(e.currentSettings,"protocolVersion",t)},expression:"currentSettings.protocolVersion"}}),t("q-checkbox",{staticClass:"q-mr-sm",staticStyle:{height:"56px"},attrs:{color:"grey-9",label:5===e.currentSettings.protocolVersion?"Clean start":"Clean session"},model:{value:e.currentSettings.clean,callback:function(t){e.$set(e.currentSettings,"clean",t)},expression:"currentSettings.clean"}}),5===e.currentSettings.protocolVersion?t("q-input",{attrs:{outlined:"","hide-bottom-space":"",dense:"",color:"grey-9 q-mb-sm",type:"number",label:"Session expiry interval",clearable:""},model:{value:e.currentSettings.properties.sessionExpiryInterval,callback:function(t){e.$set(e.currentSettings.properties,"sessionExpiryInterval",e._n(t))},expression:"currentSettings.properties.sessionExpiryInterval"}}):e._e(),t("q-input",{attrs:{outlined:"","hide-bottom-space":"",dense:"",color:"grey-9 q-mb-sm",label:"Username"},model:{value:e.currentSettings.username,callback:function(t){e.$set(e.currentSettings,"username",t)},expression:"currentSettings.username"}},[-1!==e.currentSettings.host.indexOf("flespi")?t("q-btn",{attrs:{slot:"append",flat:"",dense:"",icon:"mdi-login"},on:{click:e.flespiLoginHandler},slot:"append"}):e._e()],1),t("q-input",{attrs:{color:"grey-9 q-mb-sm",outlined:"","hide-bottom-space":"",dense:"",label:"Password"},model:{value:e.currentSettings.password,callback:function(t){e.$set(e.currentSettings,"password",t)},expression:"currentSettings.password"}}),5===e.currentSettings.protocolVersion?t("q-expansion-item",{staticClass:"q-mt-md q-mb-sm",class:[`bg-${e.$theme}-2`],attrs:{label:"Subscribe User Properties"}},[t("div",[e.currentSettings.userProperties?t("q-list",e._l(e.currentSettings.userProperties,(function(s,n){return t("q-item",{key:`${n}: ${s}`},[t("q-icon",{staticClass:"q-mr-sm cursor-pointer",attrs:{size:"1rem",name:"mdi-close-circle"},nativeOn:{click:function(t){return e.removeUserProperty(n)}}}),t("span",[e._v(e._s(`${n}: ${s}`))])],1)})),1):e._e(),t("q-input",{attrs:{color:"grey-9 q-ma-sm",outlined:"",dense:"","hide-bottom-space":"",label:"User property name"},model:{value:e.userProperty.name,callback:function(t){e.$set(e.userProperty,"name",t)},expression:"userProperty.name"}}),t("q-input",{attrs:{color:"grey-9 q-mx-sm q-mb-sm",outlined:"",dense:"","hide-bottom-space":"",label:"User property value"},model:{value:e.userProperty.value,callback:function(t){e.$set(e.userProperty,"value",t)},expression:"userProperty.value"}}),t("q-btn",{staticClass:"q-mt-sm",staticStyle:{width:"100%"},attrs:{disable:!e.userProperty.name||!e.userProperty.value,color:`${e.$theme}-9`},on:{click:e.addUserProperty}},[e._v("Add")])],1)]):e._e(),t("q-expansion-item",{staticClass:"q-mt-md q-mb-sm",class:[`bg-${e.$theme}-2`],attrs:{label:"Flespi specific features"}},[t("q-toggle",{attrs:{label:"Subscribe with token cid"},model:{value:e.currentSettings.subscribeWithTokenCid,callback:function(t){e.$set(e.currentSettings,"subscribeWithTokenCid",t)},expression:"currentSettings.subscribeWithTokenCid"}})],1),5===e.currentSettings.protocolVersion&&-1!==e.currentSettings.host.indexOf("flespi.io")?t("div",{staticClass:"share-tokens__items-wrapper col-12 relative-position q-mt-lg q-mb-md"},[t("q-list",{attrs:{bordered:""}},[t("q-item-label",{staticClass:"q-py-md q-px-sm list__header",class:[`bg-${e.$theme}-${e.currentSettings.syncCreds&&e.currentSettings.syncCreds.length?3:2}`]},[t("div",{class:{"text-red-6":!e.currentSettings.syncCreds||!e.currentSettings.syncCreds.length}},[e._v("Tokens for sharing"+e._s(e.currentSettings.syncCreds&&e.currentSettings.syncCreds.length?"":" are empty"))]),t("div",{staticClass:"text-grey-8 q-mt-xs",staticStyle:{"font-size":".8rem"}},[e._v("List of standard or ACL flespi tokens to be used for sharing boards.")]),t("q-btn",{staticClass:"absolute-right",attrs:{color:"grey-9",flat:"",label:"ADD",icon:"mdi-plus"},on:{click:e.addSyncCredsItem}})],1),e._l(e.currentSettings.syncCreds,(function(s,n){return t("q-expansion-item",{key:`${n}`,attrs:{group:"singleselect-items","header-class":["bg-"+(e.checkUniqueSyncCredsValue(s,n)?`${e.$theme}-2`:"red-2")],"expand-icon":"mdi-cog",value:n===e.currentSettings.syncCreds.length-1}},[t("template",{slot:"header"},[t("q-item-section",{attrs:{avatar:""}},[t("div",[t("q-btn",{staticClass:"col-1",attrs:{disabled:0===n,round:"",dense:"",flat:"",icon:"mdi-arrow-up"},on:{click:function(t){return t.stopPropagation(),e.upItem(n)}}}),t("q-btn",{staticClass:"col-1",attrs:{disabled:n===e.currentSettings.syncCreds.length-1,round:"",dense:"",flat:"",icon:"mdi-arrow-down"},on:{click:function(t){return t.stopPropagation(),e.downItem(n)}}})],1)]),t("q-item-section",[t("q-item-label",{staticClass:"ellipsis"},[e._v(e._s(s.label?s.label:"New token"))]),t("q-item-label",{staticClass:"text-grey-8 ellipsis",staticStyle:{"font-size":".8rem"}},[e._v(e._s(s.credentions.username||"*Empty*"))])],1),t("q-item-section",{attrs:{side:""}},[t("q-btn",{attrs:{flat:"",color:"red-6",round:"",dense:"",icon:"mdi-delete"},on:{click:function(t){return t.stopPropagation(),e.removeSyncCredsItem(n)}}})],1)],1),t("div",{staticClass:"row"},[t("div",{staticClass:"col-12 q-my-sm q-px-sm"},[t("q-input",{attrs:{autofocus:"",outlined:"",dense:"","hide-bottom-space":"",color:"grey-9",label:"Label"},model:{value:s.label,callback:function(t){e.$set(s,"label",t)},expression:"syncCreds.label"}})],1),t("div",{staticClass:"col-12 q-mb-sm q-px-sm"},[t("q-input",{attrs:{outlined:"","hide-bottom-space":"",dense:"",color:"grey-9",label:"Token",error:!e.checkUniqueSyncCredsValue(s,n)},model:{value:s.credentions.username,callback:function(t){e.$set(s.credentions,"username",t)},expression:"syncCreds.credentions.username"}})],1)])],2)}))],2)],1):e._e()],1),t("q-toolbar",{staticClass:"text-white",class:[`bg-${e.$theme}-9`]},[t("q-toolbar-title"),t("q-btn",{staticClass:"q-mr-sm",attrs:{flat:"",dense:""},on:{click:e.closeHandler}},[e._v("Close")]),t("q-btn",{attrs:{flat:"",dense:"",disable:!e.validateCurrentSettings},on:{click:e.saveSettingsHandler}},[e._v(e._s(e.settings?"Update":"Save"))])],1)],1)])}),a=[],o=s("42454"),l=s.n(o),c=s("a11b"),d=s("0644"),u=s.n(d),h=s("9224"),p={name:"ClientSettings",props:["value","settings"],data(){const e=Object(c["a"])();return{version:h["a"],defaultSettings:e,currentSettings:this.settings?l()({},e,this.settings):l()({},e),userProperty:{name:"",value:""},syncCreds:{label:"",credentions:{username:""}}}},computed:{validateCurrentSettings(){return!!this.currentSettings.clientId&&!!this.currentSettings.host&&!(0===this.currentSettings.host.indexOf("ws:"))&&(!this.currentSettings.syncCreds||!this.currentSettings.syncCreds.length||!!this.currentSettings.syncCreds&&!!this.currentSettings.syncCreds.length&&this.currentSettings.syncCreds.reduce(((e,t,s,n)=>{const i=t.credentions.username;return e[i]||(e[i]=0),e[i]++,s===n.length-1?Object.keys(e).reduce(((t,s)=>t?1===e[s]:t),!0):e}),{}))},status(){return this.value}},methods:{saveSettingsHandler(){this.$emit("save",this.currentSettings),this.closeHandler(),this.$nextTick((()=>{this.defaultSettings.clientId=`mqtt-tiles-${this.version}-${Math.random().toString(16).substring(2,8)}`,this.currentSettings=l()({},this.defaultSettings)}))},closeHandler(){this.$emit("input",!1),this.$emit("hide")},hostErrorHandler(){this.$q.notify({color:"warning",message:"Host must be not empty and only over secured sockets"})},addUserProperty(){this.currentSettings.userProperties||this.$set(this.currentSettings,"userProperties",{}),this.$set(this.currentSettings.userProperties,this.userProperty.name,this.userProperty.value),this.userProperty={value:"",name:""}},removeUserProperty(e){this.$delete(this.currentSettings.userProperties,e),Object.keys(this.currentSettings.userProperties).length||this.$set(this.currentSettings,"userProperties",null)},flespiLoginHandler(){const e=t=>{if("string"===typeof t.data&&~t.data.indexOf("FlespiLogin|token:")){let s=t.data;s=s.replace("FlespiLogin|token:",""),s=JSON.parse(s),this.currentSettings.username=s.token,this.currentSettings.host=`wss://${s.region["mqtt-ws"]}`,window.removeEventListener("message",e)}};window.addEventListener("message",e),this.openWindow("https://flespi.io/login/#/providers")},openWindow(e,t){t=t||"auth";const s=500,n=600,i=void 0!==window.screenLeft?window.screenLeft:screen.left,r=void 0!==window.screenTop?window.screenTop:screen.top,a=window.innerWidth?window.innerWidth:document.documentElement.clientWidth?document.documentElement.clientWidth:screen.width,o=window.innerHeight?window.innerHeight:document.documentElement.clientHeight?document.documentElement.clientHeight:screen.height,l=a/2-s/2+i,c=o/2-n/2+r,d=window.open(e,t,"toolbar=no,location=no,status=yes,resizable=yes,scrollbars=yes, width="+s+", height="+n+", top="+c+", left="+l);window.focus&&d.focus()},addSyncCredsItem(){this.currentSettings.syncCreds||this.$set(this.currentSettings,"syncCreds",[]),this.currentSettings.syncCreds.push(u()(this.syncCreds))},removeSyncCredsItem(e){this.$delete(this.currentSettings.syncCreds,e)},upSyncCredsItem(e){const t=this.currentSettings.syncCreds.splice(e,1)[0];this.currentSettings.syncCreds.splice(e-1,0,t)},downSyncCredsItem(e){const t=this.currentSettings.syncCreds.splice(e,1)[0];this.currentSettings.syncCreds.splice(e+1,0,t)},checkUniqueSyncCredsValue(e,t){let s=!0;return this.currentSettings.syncCreds.map((e=>e.credentions.username)).some(((n,i)=>{const r=n===e.credentions.username;return r&&(s=i===t),r})),s}},watch:{settings(e){this.currentSettings=l()({},this.defaultSettings,e)}}},m=p,g=(s("3ad4"),s("2877")),v=s("24e8"),b=s("65c6"),f=s("6ac5"),y=s("27f9"),S=s("9c40"),q=s("9564"),C=s("ddd8"),$=s("8f8e"),w=s("3b73"),k=s("1c1c"),x=s("66e5"),I=s("0016"),_=s("0170"),T=s("4074"),O=s("eebe"),P=s.n(O),Q=Object(g["a"])(m,r,a,!1,null,null,null),B=Q.exports;P()(Q,"components",{QDialog:v["a"],QToolbar:b["a"],QToolbarTitle:f["a"],QInput:y["a"],QBtn:S["a"],QToggle:q["a"],QSelect:C["a"],QCheckbox:$["a"],QExpansionItem:w["a"],QList:k["a"],QItem:x["a"],QIcon:I["a"],QItemLabel:_["a"],QItemSection:T["a"]});var H=s("18d6"),M=s("b047c"),A=s.n(M),j=s("2b0e"),N=s("e762"),L=s("5a50"),X=s("70e1"),D=s.n(X),E=s("9b02"),V=s.n(E);class F{constructor(e){this.bus=new D.a(e)}get settings(){return this.bus.settings}set settings(e){this.bus.settings=e}get token(){return this.bus.token}set token(e){this.bus.token=e}async getDevices(e){let t="all";if(e&&"all"!==e){const s=e.join(",");try{const e=await this.bus.gw.getCalcsDevices(s,"all",{fileds:"device_id"}),n=V()(e,"data.result",[]),i=n.reduce(((e,t)=>(e[t.device_id]=!0,e)),{});t=Object.keys(i).join(",")}catch(i){return[]}}const s=await this.bus.gw.getDevices(t,{fields:"id,name"});let n=V()(s,"data.result",[]);return n=n.map((e=>({label:e.name||`#${e.id}`,value:`${e.id}`}))),n}async getChannels(){const e=await this.bus.gw.getChannels("all",{fileds:"id,name"});let t=V()(e,"data.result",[]);return t=t.map((e=>({label:e.name||`#${e.id}`,value:`${e.id}`}))),t}async getCalcs(e){let t="all";if(e&&"all"!==e)try{const s=e.join(","),n=await this.bus.gw.getCalcsDevices("all",s,{fields:"calc_id"}),i=V()(n,"data.result",[]),r=i.reduce(((e,t)=>(e[t.calc_id]=!0,e)),{});t=Object.keys(r).join(",")}catch(i){return[]}const s=await this.bus.gw.getCalcs(t,{fileds:"id,name"});let n=V()(s,"data.result",[]);return n=n.map((e=>({label:e.name||`#${e.id}`,value:`${e.id}`}))),n}async getDevicesTelemetry(e){const t=await this.bus.gw.getDevicesTelemetry(e,"all");let s=V()(t,"data.result",[]);return s=s.reduce(((e,t)=>{const s=t.telemetry;return s&&(e={...e,...s}),e}),{}),s=Object.keys(s).sort().map((e=>({label:e,value:e}))),s}async getDevicesSettings(e){const t=await this.bus.gw.getDevicesSettings(e,"all",{fields:"name,schema"});let s=V()(t,"data.result",[]);return s=s.reduce(((e,t)=>{const s=t.name,n=t.schema.title;return e[s]||(e[s]={}),e[s][n]=!0,e}),{}),s=Object.keys(s).map((e=>({label:Object.keys(s[e]).join(", "),value:e}))),s}}var z=F;const U=A()((e=>{H["a"].set(L["c"],e)}),500,{trailing:!0});var W={name:"MyLayout",data(){return{showping:H["a"].getItem(L["d"])||!1,pingtime:0,clientSettingsOpened:!1,currentSettings:void 0,clients:{},activeClientId:void 0,editedClientId:void 0,connected:!1,version:h["a"],fullViewMode:!0,isConnectionsOpened:!1}},computed:{clientsIds(){return Object.keys(this.clients)}},methods:{reactivateClient(){let e=this.activeClientId;this.setActiveClient(),this.$nextTick((()=>{this.setActiveClient(e)}))},openSettings(){this.clientSettingsOpened=!0},hideSettingsHandler(){this.currentSettings=void 0,this.editedClientId=void 0},saveSettingsHandler(e){const t=this.editedClientId?this.editedClientId:this.clientsIds.length;j["default"].set(this.clients,t,e),this.setActiveClient(t)},editClientSettings(e){this.currentSettings=this.clients[e],this.editedClientId=e,this.openSettings()},removeClient(e){this.$q.dialog({title:"Delete client?",message:`Do you really want to delete «${this.clients[e].clientName}» client?`,color:"grey-9",ok:!0,cancel:!0}).onOk((()=>{this.activeClientId===e&&(this.activeClientId=void 0),j["default"].delete(this.clients,e)}))},setActiveClient(e){"number"===typeof e&&(e=String(e)),this.activeClientId=e,H["a"].set(L["a"],e),void 0!==e&&(this.setFlespiMode(e),this.makeFlespiRestBus(e))},changeStatus(e){this.connected=e},ping(e){this.pingtime=e},shareHandler(e){},clearAttachMode(e){this.$q.notify({message:"No boards attached to the connection. Showing all available boards.",timeout:3e3,color:"info",icon:"mdi-link-variant",position:"bottom-left"}),this.$delete(e,"attachedBoards")},setFlespiMode(e){const t=this.clients[e];t.host.indexOf("flespi")>-1?j["default"].prototype.$flespiMode=!0:j["default"].prototype.$flespiMode=!1},makeFlespiRestBus(e){const t=this.clients[e],s=new z({flespiApp:`mqtt-tiles(client: ${t.clientId})`});s.bus.auth.getRegions().then((e=>{e=V()(e,"data.result",[]);const n=e.reduce(((e,s)=>{const n=s["mqtt-ws"].split(":")[0];return-1!==t.host.indexOf(n)?s:e}));n?(s.settings={server:n.rest},s.token=t.username,j["default"].prototype.$flespiRestBus=s):j["default"].prototype.$flespiRestBus=null}))},changeAttachedBoards(e){e.length?this.$set(this.clients[this.activeClientId],"attachedBoards",[...e]):this.clients[this.activeClientId].attachedBoards&&this.clearAttachMode(this.clients[this.activeClientId])},deleteBoardsHandler(e){Object.keys(this.clients).forEach((t=>{this.clients[t].attachedBoards&&(this.clients[t].attachedBoards.forEach(((s,n)=>{e.includes(s)&&this.$delete(this.clients[t].attachedBoards,n)})),this.clients[t].attachedBoards.length||this.clearAttachMode(this.clients[t]))}))},addBoardsHandler(e){if(!this.activeClientId)return!1;const t=this.clients[this.activeClientId],s=!!t.attachedBoards;s&&this.$q.notify({message:"Attach new board to the connection?",timeout:0,color:"info",icon:"mdi-link-variant",position:"bottom-left",closeBtn:"Close",classes:"text-white",actions:[{label:"Attach",handler:()=>{this.$set(this.clients[this.activeClientId],"attachedBoards",[...this.clients[this.activeClientId].attachedBoards,...e])}}]})},setTheme(e="grey"){j["default"].prototype.$theme=e}},mounted(){this.$integrationBus.send("ready")},created(){const e=this.$q.sessionStorage.getItem("mqtt-tiles-share");if(j["default"].prototype.$flespiMode=!1,j["default"].prototype.$integrationMode=!1,this.setTheme("grey"),this.$root.$on("new-share-token",(e=>{const t=this.clients[this.activeClientId];t&&(t.syncCreds||(t.syncCreds=[]),t.syncCreds.push(e))})),this.$route.path.indexOf("integration")>-1)j["default"].prototype.$integrationMode=!0,this.setTheme(this.$route.query.theme),this.$integrationBus.on("SetFlespiLogin",(({token:e,region:t})=>{const s=Object(c["a"])();s.host=`wss://${t["mqtt-ws"]}`,s.username=e,this.$set(this.clients,0,s),this.setActiveClient(0)})),this.$integrationBus.on("SetTheme",(e=>{this.setTheme(e)}));else if(this.$route.params.hash||e){this.fullViewMode=!1;const t=Object(c["a"])();let s;s=this.$route.params.hash?JSON.parse(N["a"].decode(this.$route.params.hash)):e,this.$q.sessionStorage.set("mqtt-tiles-share",s),s.host&&(t.host=s.host),t.username=s.token,t.syncNamespace=s.topic,t.syncToRetain=!0,t.flespiBoard=s.boardId,j["default"].set(this.clients,0,t),this.setActiveClient(0)}else{const e=H["a"].getItem(L["c"]);let t=H["a"].getItem(L["a"]);if(e){if(this.clients=e,this.$route.params.flespiToken){const e=this.$route.params.flespiToken.replace("FlespiToken ",""),s=this.clientsIds.filter((t=>{const s=this.clients[t].username.replace("FlespiToken ","");return e===s}));if(s.length)t=s[0];else{const s=Object(c["a"])();s.username=e;const n=(parseInt(this.clientsIds[this.clientsIds.slice(-1)])+1).toString();j["default"].set(this.clients,n,s),t=n}this.$router.push("/")}t&&this.clients[t]&&this.$nextTick((()=>{this.setActiveClient(t)}))}}},watch:{clients:{deep:!0,handler(e){this.fullViewMode&&U(e)}},showping(e){H["a"].set(L["d"],e)}},components:{clientSettings:B}},R=W,J=s("4d5a"),K=s("e359"),G=s("05c0"),Y=s("4e73"),Z=s("eb85"),ee=s("09e3"),te=s("7f67"),se=Object(g["a"])(R,n,i,!1,null,null,null);t["default"]=se.exports;P()(se,"components",{QLayout:J["a"],QHeader:K["a"],QToolbar:b["a"],QToolbarTitle:f["a"],QBtn:S["a"],QTooltip:G["a"],QMenu:Y["a"],QList:k["a"],QItemLabel:_["a"],QItem:x["a"],QItemSection:T["a"],QIcon:I["a"],QSeparator:Z["a"],QToggle:q["a"],QPageContainer:ee["a"]}),P()(se,"directives",{ClosePopup:te["a"]})}}]);