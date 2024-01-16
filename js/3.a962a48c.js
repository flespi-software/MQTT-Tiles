(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[3],{"5a50":function(t,e,s){"use strict";s.d(e,"b",(function(){return n})),s.d(e,"k",(function(){return a})),s.d(e,"l",(function(){return o})),s.d(e,"c",(function(){return i})),s.d(e,"a",(function(){return r})),s.d(e,"h",(function(){return l})),s.d(e,"g",(function(){return c})),s.d(e,"i",(function(){return d})),s.d(e,"j",(function(){return u})),s.d(e,"d",(function(){return h})),s.d(e,"f",(function(){return m})),s.d(e,"e",(function(){return p})),s.d(e,"s",(function(){return g})),s.d(e,"o",(function(){return b})),s.d(e,"m",(function(){return v})),s.d(e,"r",(function(){return f})),s.d(e,"q",(function(){return y})),s.d(e,"p",(function(){return S})),s.d(e,"n",(function(){return q}));const n="mqtt-tiles-boards",i="mqtt-tiles-clients",r="mqtt-tiles-active-client",a=0,o=1,l=0,c=1,d=0,u=1,h=0,m=1,p=2,g=0,b=1,v=2,f=3,y=4,S=5,q=6},7094:function(t,e,s){},9224:function(t){t.exports=JSON.parse('{"a":"1.16.6"}')},a11b:function(t,e,s){"use strict";s.d(e,"a",(function(){return n})),s.d(e,"b",(function(){return i}));const n=()=>({clientName:"New client",clientId:`mqtt-tiles-${Math.random().toString(16).substr(2,8)}`,host:"wss://mqtt.flespi.io",keepalive:60,protocolVersion:5,clean:!0,username:"FlespiToken XXXXXXXXXXXXXXXXXXX",password:"",properties:{sessionExpiryInterval:void 0},subscribeWithTokenCid:!0,syncNamespace:"xflespifront/mqtttiles/boards"}),i=(t={})=>({topicTemplate:"",topicFilter:"",payloadType:0,payloadField:"",payloadNameField:"",default:"",...t})},f241:function(t,e,s){"use strict";s.r(e);var n=function(){var t=this,e=t._self._c;return e("q-layout",{attrs:{view:"hHh Lpr lFf"}},[e("client-settings",{attrs:{settings:t.currentSettings},on:{save:t.saveSettingsHandler,hide:t.hideSettingsHandler},model:{value:t.clientSettingsOpened,callback:function(e){t.clientSettingsOpened=e},expression:"clientSettingsOpened"}}),t.fullViewMode?e("q-header",[e("q-toolbar",{class:[`bg-${t.$theme}-9`]},[e("q-toolbar-title",{staticStyle:{"line-height":"36px"}},[e("img",{staticStyle:{height:"30px","vertical-align":"text-bottom"},attrs:{src:"mqtttiles-logo.png",alt:"MQTT Tiles"}}),t._v("\n        MQTT Tiles\n        "),e("sup",{staticStyle:{position:"relative","font-size":".9rem","padding-left":"4px"}},[t._v(t._s(t.version))])]),t.fullViewMode&&!t.$integrationMode?e("q-btn",{attrs:{flat:"",icon:"mdi-lan-connect"}},[t.activeClientId?e("div",{staticClass:"q-ml-sm"},[e("div",[t._v(t._s(t.clients[t.activeClientId].clientName))]),e("div",{class:[`text-${t.connected?"green":"red"}-3`],staticStyle:{"font-size":"0.6rem","line-height":"0.6rem"}},[t._v("Connected")])]):e("div",{staticClass:"text-italic q-ml-sm"},[t._v("Choose connection")]),e("q-tooltip",[t._v("Connections")]),e("q-menu",{attrs:{persistent:!0,offset:[0,5]},on:{hide:function(e){t.isConnectionsOpened=!1},show:function(e){t.isConnectionsOpened=!0}}},[e("div",{staticStyle:{"min-width":"300px"},style:{minHeight:t.clientsIds.length?"300px":"200px"}},[e("div",{staticClass:"connections__subheader q-px-md",class:[`bg-${t.$theme}-9`],staticStyle:{position:"relative",height:"70px"}},[e("span",{staticClass:"text-white",staticStyle:{"font-size":"1.4rem","line-height":"70px"}},[t._v("My connections")]),e("q-btn",{staticClass:"text-white",staticStyle:{position:"absolute",bottom:"-20px",right:"16px","z-index":"1"},attrs:{"fab-mini":"",icon:"mdi-plus",color:`${t.$theme}-7`},on:{click:t.openSettings}})],1),t.clientsIds.length?e("q-list",{staticClass:"scroll",class:[`bg-${t.$theme}-1`],staticStyle:{position:"absolute",top:"70px",bottom:"0",right:"0",left:"0"}},[e("q-item-label",{staticClass:"q-py-md q-pl-md text-grey-9"},[e("span",[t._v("Connections")])]),t._l(t.clients,(function(s,n){return e("q-item",{key:n,attrs:{clickable:"",active:n===t.activeClientId},on:{click:function(e){return t.setActiveClient(n)}}},[e("q-item-section",{attrs:{avatar:""}},[t.connected&&n===t.activeClientId?e("q-btn",{attrs:{color:"green",icon:"mdi-lan-connect",dense:"",flat:""},on:{click:function(e){return e.stopPropagation(),t.setActiveClient()}}},[e("q-tooltip",[t._v("Disconnect")])],1):e("q-icon",{staticClass:"q-ma-xs",attrs:{name:"mdi-lan-disconnect",size:"1.5rem",color:n===t.activeClientId?"red":""}},[n===t.activeClientId?e("q-tooltip",[t._v("Active")]):t._e()],1)],1),e("q-item-section",[e("q-item-label",{class:{[`text-${t.connected?"green":"red"}-6`]:n===t.activeClientId}},[e("div",{staticStyle:{"max-width":"calc(100% - 25px)",display:"inline-flex"}},[e("div",{staticClass:"ellipsis"},[t._v(t._s(s.clientName))])]),e("div",{staticStyle:{display:"inline-flex"}},[s.attachedBoards&&s.attachedBoards.length?e("q-icon",{staticClass:"q-ml-xs",attrs:{name:"mdi-link-variant",flat:"",dense:"",size:"15px",color:"yellow-9"}},[e("q-tooltip",[t._v("\n                          "+t._s(`Attached boards: ${s.attachedBoards.join(", ")}`)+"\n                        ")])],1):t._e()],1)]),e("q-item-label",{staticClass:"ellipsis",attrs:{caption:""}},[t._v(t._s(s.host))])],1),e("q-item-section",{staticStyle:{"padding-left":"4px!important"},attrs:{side:""}},[e("q-btn",{attrs:{round:"",flat:"",dense:"",icon:"mdi-dots-vertical"},on:{click:function(t){t.stopPropagation()}}},[e("q-menu",{attrs:{anchor:"bottom right",self:"top right"}},[e("q-list",{class:[`bg-${t.$theme}-1`]},[e("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:""},on:{click:function(e){return t.editClientSettings(n)}}},[e("q-item-section",{attrs:{avatar:""}},[e("q-icon",{attrs:{name:"mdi-cog"}})],1),e("q-item-section",[t._v("Edit")])],1),e("q-separator"),e("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:""},on:{click:function(e){return t.removeClient(n)}}},[e("q-item-section",{attrs:{avatar:""}},[e("q-icon",{attrs:{name:"mdi-delete-outline",color:"red"}})],1),e("q-item-section",[t._v("Remove")])],1)],1)],1)],1)],1)],1)}))],2):e("div",{staticClass:"q-px-md q-pt-lg text-center"},[e("div",{staticClass:"text-bold"},[t._v("No connections")]),e("div",{staticStyle:{"font-size":".8rem"}},[t._v("Create a connection to visualize its data on boards")])])],1)])],1):t._e()],1)],1):t._e(),e("q-page-container",[e("router-view",{attrs:{client:t.clients[t.activeClientId]},on:{"change-status":t.changeStatus,share:t.shareHandler,"change:attach":t.changeAttachedBoards,"delete:boards":t.deleteBoardsHandler,"add:boards":t.addBoardsHandler,"update-client-settings":function(e){return t.editClientSettings(t.activeClientId)}}})],1)],1)},i=[],r=(s("14d9"),function(){var t=this,e=t._self._c;return e("q-dialog",{attrs:{maximized:t.$q.screen.lt.md},on:{hide:t.closeHandler},model:{value:t.status,callback:function(e){t.status=e},expression:"status"}},[e("div",{style:{width:t.$q.screen.lt.md?"100%":"50vw"}},[e("q-toolbar",{staticClass:"text-white",class:[`bg-${t.$theme}-9`]},[e("q-toolbar-title",[t._v("\n        MQTT client\n      ")])],1),e("div",{staticClass:"q-pa-md scroll",class:[`bg-${t.$theme}-1`],style:{height:t.$q.screen.lt.md?"calc(100% - 100px)":"50vh"}},[e("q-input",{attrs:{color:"grey-9 q-mb-sm",outlined:"","hide-bottom-space":"",dense:"",label:"MQTT client name",error:!t.currentSettings.clientName},model:{value:t.currentSettings.clientName,callback:function(e){t.$set(t.currentSettings,"clientName",e)},expression:"currentSettings.clientName"}}),e("q-input",{attrs:{color:"grey-9 q-mb-sm",outlined:"","hide-bottom-space":"",dense:"",label:"Client ID",error:!t.currentSettings.clientId},model:{value:t.currentSettings.clientId,callback:function(e){t.$set(t.currentSettings,"clientId",e)},expression:"currentSettings.clientId"}},[e("q-btn",{attrs:{slot:"append",flat:"",dense:"",icon:"mdi-refresh"},on:{click:function(e){t.currentSettings.clientId=`mqtt-tiles-${Math.random().toString(16).substr(2,8)}`}},slot:"append"})],1),e("q-input",{attrs:{color:"grey-9 q-mb-sm",outlined:"","hide-bottom-space":"",dense:"",label:"Host",error:!t.currentSettings.host||0===t.currentSettings.host.indexOf("ws:")},model:{value:t.currentSettings.host,callback:function(e){t.$set(t.currentSettings,"host",e)},expression:"currentSettings.host"}},[t.currentSettings.host&&0!==t.currentSettings.host.indexOf("ws:")?t._e():e("q-btn",{attrs:{slot:"append",flat:"",dense:"",icon:"mdi-alert-outline"},on:{click:t.hostErrorHandler},slot:"append"})],1),e("q-input",{attrs:{color:"grey-9 q-mb-sm",outlined:"","hide-bottom-space":"",dense:"",type:"number",label:"Keep alive"},model:{value:t.currentSettings.keepalive,callback:function(e){t.$set(t.currentSettings,"keepalive",t._n(e))},expression:"currentSettings.keepalive"}}),e("q-select",{attrs:{color:"grey-9 q-mb-sm",outlined:"",dense:"","hide-bottom-space":"","emit-value":"","map-options":"",options:[{label:"3.1.1",value:4},{label:"5.0",value:5}],label:"Version of MQTT"},model:{value:t.currentSettings.protocolVersion,callback:function(e){t.$set(t.currentSettings,"protocolVersion",e)},expression:"currentSettings.protocolVersion"}}),e("q-checkbox",{staticClass:"q-mr-sm",staticStyle:{height:"56px"},attrs:{color:"grey-9",label:5===t.currentSettings.protocolVersion?"Clean start":"Clean session"},model:{value:t.currentSettings.clean,callback:function(e){t.$set(t.currentSettings,"clean",e)},expression:"currentSettings.clean"}}),5===t.currentSettings.protocolVersion?e("q-input",{attrs:{outlined:"","hide-bottom-space":"",dense:"",color:"grey-9 q-mb-sm",type:"number",label:"Session expiry interval",clearable:""},model:{value:t.currentSettings.properties.sessionExpiryInterval,callback:function(e){t.$set(t.currentSettings.properties,"sessionExpiryInterval",t._n(e))},expression:"currentSettings.properties.sessionExpiryInterval"}}):t._e(),e("q-input",{attrs:{outlined:"","hide-bottom-space":"",dense:"",color:"grey-9 q-mb-sm",label:"Username"},model:{value:t.currentSettings.username,callback:function(e){t.$set(t.currentSettings,"username",e)},expression:"currentSettings.username"}},[-1!==t.currentSettings.host.indexOf("flespi")?e("q-btn",{attrs:{slot:"append",flat:"",dense:"",icon:"mdi-login"},on:{click:t.flespiLoginHandler},slot:"append"}):t._e()],1),e("q-input",{attrs:{color:"grey-9 q-mb-sm",outlined:"","hide-bottom-space":"",dense:"",label:"Password"},model:{value:t.currentSettings.password,callback:function(e){t.$set(t.currentSettings,"password",e)},expression:"currentSettings.password"}}),5===t.currentSettings.protocolVersion?e("q-expansion-item",{staticClass:"q-mt-md q-mb-sm",class:[`bg-${t.$theme}-2`],attrs:{label:"Subscribe User Properties"}},[e("div",[t.currentSettings.userProperties?e("q-list",t._l(t.currentSettings.userProperties,(function(s,n){return e("q-item",{key:`${n}: ${s}`},[e("q-icon",{staticClass:"q-mr-sm cursor-pointer",attrs:{size:"1rem",name:"mdi-close-circle"},nativeOn:{click:function(e){return t.removeUserProperty(n)}}}),e("span",[t._v(t._s(`${n}: ${s}`))])],1)})),1):t._e(),e("q-input",{attrs:{color:"grey-9 q-ma-sm",outlined:"",dense:"","hide-bottom-space":"",label:"User property name"},model:{value:t.userProperty.name,callback:function(e){t.$set(t.userProperty,"name",e)},expression:"userProperty.name"}}),e("q-input",{attrs:{color:"grey-9 q-mx-sm q-mb-sm",outlined:"",dense:"","hide-bottom-space":"",label:"User property value"},model:{value:t.userProperty.value,callback:function(e){t.$set(t.userProperty,"value",e)},expression:"userProperty.value"}}),e("q-btn",{staticClass:"q-mt-sm",staticStyle:{width:"100%"},attrs:{disable:!t.userProperty.name||!t.userProperty.value,color:`${t.$theme}-9`},on:{click:t.addUserProperty}},[t._v("Add")])],1)]):t._e(),e("q-expansion-item",{staticClass:"q-mt-md q-mb-sm",class:[`bg-${t.$theme}-2`],attrs:{label:"Flespi specific features"}},[e("q-toggle",{attrs:{label:"Subscribe with token cid"},model:{value:t.currentSettings.subscribeWithTokenCid,callback:function(e){t.$set(t.currentSettings,"subscribeWithTokenCid",e)},expression:"currentSettings.subscribeWithTokenCid"}})],1),5===t.currentSettings.protocolVersion&&-1!==t.currentSettings.host.indexOf("flespi.io")?e("div",{staticClass:"share-tokens__items-wrapper col-12 relative-position q-mt-lg q-mb-md"},[e("q-list",{attrs:{bordered:""}},[e("q-item-label",{staticClass:"q-py-md q-px-sm list__header",class:[`bg-${t.$theme}-${t.currentSettings.syncCreds&&t.currentSettings.syncCreds.length?3:2}`]},[e("div",{class:{"text-red-6":!t.currentSettings.syncCreds||!t.currentSettings.syncCreds.length}},[t._v("Tokens for sharing"+t._s(t.currentSettings.syncCreds&&t.currentSettings.syncCreds.length?"":" are empty"))]),e("div",{staticClass:"text-grey-8 q-mt-xs",staticStyle:{"font-size":".8rem"}},[t._v("List of standard or ACL flespi tokens to be used for sharing boards.")]),e("q-btn",{staticClass:"absolute-right",attrs:{color:"grey-9",flat:"",label:"ADD",icon:"mdi-plus"},on:{click:t.addSyncCredsItem}})],1),t._l(t.currentSettings.syncCreds,(function(s,n){return e("q-expansion-item",{key:`${n}`,attrs:{group:"singleselect-items","header-class":["bg-"+(t.checkUniqueSyncCredsValue(s,n)?`${t.$theme}-2`:"red-2")],"expand-icon":"mdi-cog",value:n===t.currentSettings.syncCreds.length-1}},[e("template",{slot:"header"},[e("q-item-section",{attrs:{avatar:""}},[e("div",[e("q-btn",{staticClass:"col-1",attrs:{disabled:0===n,round:"",dense:"",flat:"",icon:"mdi-arrow-up"},on:{click:function(e){return e.stopPropagation(),t.upItem(n)}}}),e("q-btn",{staticClass:"col-1",attrs:{disabled:n===t.currentSettings.syncCreds.length-1,round:"",dense:"",flat:"",icon:"mdi-arrow-down"},on:{click:function(e){return e.stopPropagation(),t.downItem(n)}}})],1)]),e("q-item-section",[e("q-item-label",{staticClass:"ellipsis"},[t._v(t._s(s.label?s.label:"New token"))]),e("q-item-label",{staticClass:"text-grey-8 ellipsis",staticStyle:{"font-size":".8rem"}},[t._v(t._s(s.credentions.username||"*Empty*"))])],1),e("q-item-section",{attrs:{side:""}},[e("q-btn",{attrs:{flat:"",color:"red-6",round:"",dense:"",icon:"mdi-delete"},on:{click:function(e){return e.stopPropagation(),t.removeSyncCredsItem(n)}}})],1)],1),e("div",{staticClass:"row"},[e("div",{staticClass:"col-12 q-my-sm q-px-sm"},[e("q-input",{attrs:{autofocus:"",outlined:"",dense:"","hide-bottom-space":"",color:"grey-9",label:"Label"},model:{value:s.label,callback:function(e){t.$set(s,"label",e)},expression:"syncCreds.label"}})],1),e("div",{staticClass:"col-12 q-mb-sm q-px-sm"},[e("q-input",{attrs:{outlined:"","hide-bottom-space":"",dense:"",color:"grey-9",label:"Token",error:!t.checkUniqueSyncCredsValue(s,n)},model:{value:s.credentions.username,callback:function(e){t.$set(s.credentions,"username",e)},expression:"syncCreds.credentions.username"}})],1)])],2)}))],2)],1):t._e()],1),e("q-toolbar",{staticClass:"text-white",class:[`bg-${t.$theme}-9`]},[e("q-toolbar-title"),e("q-btn",{staticClass:"q-mr-sm",attrs:{flat:"",dense:""},on:{click:t.closeHandler}},[t._v("Close")]),e("q-btn",{attrs:{flat:"",dense:"",disable:!t.validateCurrentSettings},on:{click:t.saveSettingsHandler}},[t._v(t._s(t.settings?"Update":"Save"))])],1)],1)])}),a=[],o=s("42454"),l=s.n(o),c=s("a11b"),d=s("0644"),u=s.n(d),h={name:"ClientSettings",props:["value","settings"],data(){const t=Object(c["a"])();return{defaultSettings:t,currentSettings:this.settings?l()({},t,this.settings):l()({},t),userProperty:{name:"",value:""},syncCreds:{label:"",credentions:{username:""}}}},computed:{validateCurrentSettings(){return!!this.currentSettings.clientId&&!!this.currentSettings.host&&!(0===this.currentSettings.host.indexOf("ws:"))&&(!this.currentSettings.syncCreds||!this.currentSettings.syncCreds.length||!!this.currentSettings.syncCreds&&!!this.currentSettings.syncCreds.length&&this.currentSettings.syncCreds.reduce(((t,e,s,n)=>{const i=e.credentions.username;return t[i]||(t[i]=0),t[i]++,s===n.length-1?Object.keys(t).reduce(((e,s)=>e?1===t[s]:e),!0):t}),{}))},status(){return this.value}},methods:{saveSettingsHandler(){this.$emit("save",this.currentSettings),this.closeHandler(),this.$nextTick((()=>{this.defaultSettings.clientId=`mqtt-tiles-${Math.random().toString(16).substr(2,8)}`,this.currentSettings=l()({},this.defaultSettings)}))},closeHandler(){this.$emit("input",!1),this.$emit("hide")},hostErrorHandler(){this.$q.notify({color:"warning",message:"Host must be not empty and only over secured sockets"})},addUserProperty(){this.currentSettings.userProperties||this.$set(this.currentSettings,"userProperties",{}),this.$set(this.currentSettings.userProperties,this.userProperty.name,this.userProperty.value),this.userProperty={value:"",name:""}},removeUserProperty(t){this.$delete(this.currentSettings.userProperties,t),Object.keys(this.currentSettings.userProperties).length||this.$set(this.currentSettings,"userProperties",null)},flespiLoginHandler(){const t=e=>{if("string"===typeof e.data&&~e.data.indexOf("FlespiLogin|token:")){let s=e.data;s=s.replace("FlespiLogin|token:",""),s=JSON.parse(s),this.currentSettings.username=s.token,this.currentSettings.host=`wss://${s.region["mqtt-ws"]}`,window.removeEventListener("message",t)}};window.addEventListener("message",t),this.openWindow("https://flespi.io/login/#/providers")},openWindow(t,e){e=e||"auth";const s=500,n=600,i=void 0!==window.screenLeft?window.screenLeft:screen.left,r=void 0!==window.screenTop?window.screenTop:screen.top,a=window.innerWidth?window.innerWidth:document.documentElement.clientWidth?document.documentElement.clientWidth:screen.width,o=window.innerHeight?window.innerHeight:document.documentElement.clientHeight?document.documentElement.clientHeight:screen.height,l=a/2-s/2+i,c=o/2-n/2+r,d=window.open(t,e,"toolbar=no,location=no,status=yes,resizable=yes,scrollbars=yes, width="+s+", height="+n+", top="+c+", left="+l);window.focus&&d.focus()},addSyncCredsItem(){this.currentSettings.syncCreds||this.$set(this.currentSettings,"syncCreds",[]),this.currentSettings.syncCreds.push(u()(this.syncCreds))},removeSyncCredsItem(t){this.$delete(this.currentSettings.syncCreds,t)},upSyncCredsItem(t){const e=this.currentSettings.syncCreds.splice(t,1)[0];this.currentSettings.syncCreds.splice(t-1,0,e)},downSyncCredsItem(t){const e=this.currentSettings.syncCreds.splice(t,1)[0];this.currentSettings.syncCreds.splice(t+1,0,e)},checkUniqueSyncCredsValue(t,e){let s=!0;return this.currentSettings.syncCreds.map((t=>t.credentions.username)).some(((n,i)=>{const r=n===t.credentions.username;return r&&(s=i===e),r})),s}},watch:{settings(t){this.currentSettings=l()({},this.defaultSettings,t)}}},m=h,p=(s("f810"),s("2877")),g=s("24e8"),b=s("65c6"),v=s("6ac5"),f=s("27f9"),y=s("9c40"),S=s("ddd8"),q=s("8f8e"),C=s("3b73"),$=s("1c1c"),w=s("66e5"),k=s("0016"),x=s("9564"),I=s("0170"),_=s("4074"),T=s("eebe"),O=s.n(T),P=Object(p["a"])(m,r,a,!1,null,null,null),Q=P.exports;O()(P,"components",{QDialog:g["a"],QToolbar:b["a"],QToolbarTitle:v["a"],QInput:f["a"],QBtn:y["a"],QSelect:S["a"],QCheckbox:q["a"],QExpansionItem:C["a"],QList:$["a"],QItem:w["a"],QIcon:k["a"],QToggle:x["a"],QItemLabel:I["a"],QItemSection:_["a"]});var B=s("18d6"),H=s("b047c"),M=s.n(H),j=s("2b0e"),A=s("e762"),N=s("5a50"),L=s("9224"),X=s("70e1"),E=s.n(X),V=s("9b02"),D=s.n(V);class F{constructor(t){this.bus=new E.a(t)}get settings(){return this.bus.settings}set settings(t){this.bus.settings=t}get token(){return this.bus.token}set token(t){this.bus.token=t}async getDevices(t){let e="all";if(t&&"all"!==t){const s=t.join(",");try{const t=await this.bus.gw.getCalcsDevices(s,"all",{fileds:"device_id"}),n=D()(t,"data.result",[]),i=n.reduce(((t,e)=>(t[e.device_id]=!0,t)),{});e=Object.keys(i).join(",")}catch(i){return[]}}const s=await this.bus.gw.getDevices(e,{fields:"id,name"});let n=D()(s,"data.result",[]);return n=n.map((t=>({label:t.name||`#${t.id}`,value:`${t.id}`}))),n}async getChannels(){const t=await this.bus.gw.getChannels("all",{fileds:"id,name"});let e=D()(t,"data.result",[]);return e=e.map((t=>({label:t.name||`#${t.id}`,value:`${t.id}`}))),e}async getCalcs(t){let e="all";if(t&&"all"!==t)try{const s=t.join(","),n=await this.bus.gw.getCalcsDevices("all",s,{fields:"calc_id"}),i=D()(n,"data.result",[]),r=i.reduce(((t,e)=>(t[e.calc_id]=!0,t)),{});e=Object.keys(r).join(",")}catch(i){return[]}const s=await this.bus.gw.getCalcs(e,{fileds:"id,name"});let n=D()(s,"data.result",[]);return n=n.map((t=>({label:t.name||`#${t.id}`,value:`${t.id}`}))),n}async getDevicesTelemetry(t){const e=await this.bus.gw.getDevicesTelemetry(t,"all");let s=D()(e,"data.result",[]);return s=s.reduce(((t,e)=>{const s=e.telemetry;return s&&(t={...t,...s}),t}),{}),s=Object.keys(s).sort().map((t=>({label:t,value:t}))),s}async getDevicesSettings(t){const e=await this.bus.gw.getDevicesSettings(t,"all",{fields:"name,schema"});let s=D()(e,"data.result",[]);return s=s.reduce(((t,e)=>{const s=e.name,n=e.schema.title;return t[s]||(t[s]={}),t[s][n]=!0,t}),{}),s=Object.keys(s).map((t=>({label:Object.keys(s[t]).join(", "),value:t}))),s}}var z=F;const U=M()((t=>{B["a"].set(N["c"],t)}),500,{trailing:!0});var W={name:"MyLayout",data(){return{clientSettingsOpened:!1,currentSettings:void 0,clients:{},activeClientId:void 0,editedClientId:void 0,connected:!1,version:L["a"],fullViewMode:!0,isConnectionsOpened:!1}},computed:{clientsIds(){return Object.keys(this.clients)}},methods:{reactivateClient(){let t=this.activeClientId;this.setActiveClient(),this.$nextTick((()=>{this.setActiveClient(t)}))},openSettings(){this.clientSettingsOpened=!0},hideSettingsHandler(){this.currentSettings=void 0,this.editedClientId=void 0},saveSettingsHandler(t){const e=this.editedClientId?this.editedClientId:this.clientsIds.length;j["default"].set(this.clients,e,t),this.setActiveClient(e)},editClientSettings(t){this.currentSettings=this.clients[t],this.editedClientId=t,this.openSettings()},removeClient(t){this.$q.dialog({title:"Delete client?",message:`Do you really want to delete «${this.clients[t].clientName}» client?`,color:"grey-9",ok:!0,cancel:!0}).onOk((()=>{this.activeClientId===t&&(this.activeClientId=void 0),j["default"].delete(this.clients,t)}))},setActiveClient(t){"number"===typeof t&&(t=String(t)),this.activeClientId=t,B["a"].set(N["a"],t),void 0!==t&&(this.setFlespiMode(t),this.makeFlespiRestBus(t))},changeStatus(t){this.connected=t},shareHandler(t){},clearAttachMode(t){this.$q.notify({message:"No boards attached to the connection. Showing all available boards.",timeout:3e3,color:"info",icon:"mdi-link-variant",position:"bottom-left"}),this.$delete(t,"attachedBoards")},setFlespiMode(t){const e=this.clients[t];e.host.indexOf("flespi")>-1?j["default"].prototype.$flespiMode=!0:j["default"].prototype.$flespiMode=!1},makeFlespiRestBus(t){const e=this.clients[t],s=new z({flespiApp:`mqtt-tiles(client: ${e.clientId})`});s.bus.auth.getRegions().then((t=>{t=D()(t,"data.result",[]);const n=t.reduce(((t,s)=>{const n=s["mqtt-ws"].split(":")[0];return-1!==e.host.indexOf(n)?s:t}));n?(s.settings={server:n.rest},s.token=e.username,j["default"].prototype.$flespiRestBus=s):j["default"].prototype.$flespiRestBus=null}))},changeAttachedBoards(t){t.length?this.$set(this.clients[this.activeClientId],"attachedBoards",[...t]):this.clients[this.activeClientId].attachedBoards&&this.clearAttachMode(this.clients[this.activeClientId])},deleteBoardsHandler(t){Object.keys(this.clients).forEach((e=>{this.clients[e].attachedBoards&&(this.clients[e].attachedBoards.forEach(((s,n)=>{t.includes(s)&&this.$delete(this.clients[e].attachedBoards,n)})),this.clients[e].attachedBoards.length||this.clearAttachMode(this.clients[e]))}))},addBoardsHandler(t){if(!this.activeClientId)return!1;const e=this.clients[this.activeClientId],s=!!e.attachedBoards;s&&this.$q.notify({message:"Attach new board to the connection?",timeout:0,color:"info",icon:"mdi-link-variant",position:"bottom-left",closeBtn:"Close",classes:"text-white",actions:[{label:"Attach",handler:()=>{this.$set(this.clients[this.activeClientId],"attachedBoards",[...this.clients[this.activeClientId].attachedBoards,...t])}}]})},setTheme(t="grey"){j["default"].prototype.$theme=t}},mounted(){this.$integrationBus.send("ready")},created(){const t=this.$q.sessionStorage.getItem("mqtt-tiles-share");if(j["default"].prototype.$flespiMode=!1,j["default"].prototype.$integrationMode=!1,this.setTheme("grey"),this.$root.$on("new-share-token",(t=>{const e=this.clients[this.activeClientId];e&&(e.syncCreds||(e.syncCreds=[]),e.syncCreds.push(t))})),this.$route.path.indexOf("integration")>-1)j["default"].prototype.$integrationMode=!0,this.setTheme(this.$route.query.theme),this.$integrationBus.on("SetFlespiLogin",(({token:t,region:e})=>{const s=Object(c["a"])();s.host=`wss://${e["mqtt-ws"]}`,s.username=t,this.$set(this.clients,0,s),this.setActiveClient(0)})),this.$integrationBus.on("SetTheme",(t=>{this.setTheme(t)}));else if(this.$route.params.hash||t){this.fullViewMode=!1;const e=Object(c["a"])();let s;s=this.$route.params.hash?JSON.parse(A["a"].decode(this.$route.params.hash)):t,this.$q.sessionStorage.set("mqtt-tiles-share",s),s.host&&(e.host=s.host),e.username=s.token,e.syncNamespace=s.topic,e.syncToRetain=!0,e.flespiBoard=s.boardId,j["default"].set(this.clients,0,e),this.setActiveClient(0)}else{const t=B["a"].getItem(N["c"]);let e=B["a"].getItem(N["a"]);if(t){if(this.clients=t,this.$route.params.flespiToken){const t=this.$route.params.flespiToken.replace("FlespiToken ",""),s=this.clientsIds.filter((e=>{const s=this.clients[e].username.replace("FlespiToken ","");return t===s}));if(s.length)e=s[0];else{const s=Object(c["a"])();s.username=t;const n=(parseInt(this.clientsIds[this.clientsIds.slice(-1)])+1).toString();j["default"].set(this.clients,n,s),e=n}this.$router.push("/")}e&&this.clients[e]&&this.$nextTick((()=>{this.setActiveClient(e)}))}}},watch:{clients:{deep:!0,handler(t){this.fullViewMode&&U(t)}}},components:{clientSettings:Q}},R=W,J=s("4d5a"),K=s("e359"),G=s("05c0"),Y=s("4e73"),Z=s("eb85"),tt=s("09e3"),et=s("7f67"),st=Object(p["a"])(R,n,i,!1,null,null,null);e["default"]=st.exports;O()(st,"components",{QLayout:J["a"],QHeader:K["a"],QToolbar:b["a"],QToolbarTitle:v["a"],QBtn:y["a"],QTooltip:G["a"],QMenu:Y["a"],QList:$["a"],QItemLabel:I["a"],QItem:w["a"],QItemSection:_["a"],QIcon:k["a"],QSeparator:Z["a"],QPageContainer:tt["a"]}),O()(st,"directives",{ClosePopup:et["a"]})},f810:function(t,e,s){"use strict";s("7094")}}]);