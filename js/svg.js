/*

An SVG Class for storing and retreiving SVG images

*/



scalar = (function() {
	
	// Where we will store all of the svg image fragments i.e. the contents of an <svg> element, with the element removed
	var frag 		= {};
	var Interval 		= {};
	var toggling		= {};
	var target 		= {};
	var val 		= {};
	var group		= {};
	var iconsInit		= {active:0,interval:0,counter:0,callback:null};
	
	//Create a set of Arrays to store SVG Groups
	var groups 		= new Array();
	groups['all'] 		= new Array();
	
	// Copies all attributes from scalar.img to scalar.svgNode
	var copyElementAttributes = function() {	
		if ( scalar.img ) {
			var attrs = scalar.img.attributes;
			
			// Copy each attr from the IMG node, to the new SVG node
			for ( i=0; i<=attrs.length; i++ ) { 
				if ( attrs[i] ) {
					
					// The name/value pair for each attribute
					var name = attrs[i].name;
					var val = attrs[i].value;
					
					// Skip the src (junk) and onLoad(used for img/svg swap)...
					if ( name != 'src' && name != 'onload' ) {					
						scalar.svgNode.setAttribute(name,val);	
					}
				}
			}
		}
	}

	
	// Generates a SVG nodeset, when passed a valid SVG string
	var createSVG = function(svgString) {
		var dummy 		= document.createElement('dummy');
		dummy.innerHTML 	= svgString;
		return 			dummy.firstChild;	
	}
	
	
	// Creates an SVG icon
	var icon = function( ev, iconID, groupID, icon, f1, nameSpaceID, initCallback ) {
		
		/**
		
		Function:
 			* To create SVG icons, with Filter effects supplied.
 			* Filter effect can be defined as active or inactive on creation.
 			* Will replace calling element (IMG) once SVG node is generated.
		  
		Vars:
			ev		Event Object	The calling event for the icons creation, is used to gather the target for later replacement with generated SVG element
			iconID		String		The UNIQUE id string for this icon, if not unique, icon generation will fail, and code relying on it will also fail
			groupID		String		A group id string, can be used to toggle ALL icons in this group using toggleGroupFilters()
			
			icon		NestedArray	An Array of Arrays, each Array within defines one level of the icon, composited from first icon in array (background) to last (foreground)
			
			f1		Array		An Array that defines the filter to be applied
			nameSpaceID	String		Blah
			initCallback	Function	A function to be called, when all current icon drawing tasks have been complete for 300 ms
		*/

		
		//Callback,when no icon creations take place for 300ms or more...
		if ( !iconsInit.active && initCallback ) {	
			iconsInit.active 	= 1;
			iconsInit.counter 	= 0;
			iconsInit.callback	= initCallback;
			
			iconsInit.checkComplete = function(){
				console.log(scalar.iconsInit.counter);
				scalar.iconsInit.counter++;
				
				// X ms have passed since last clock reset, do Callback
				if ( scalar.iconsInit.counter > 2 ) { 
					scalar.iconsInit.callback();
					scalar.iconsInit.active 	= 0;
					scalar.iconsInit.counter 	= 0;
					clearInterval(scalar.iconsInit.interval);
				}
			}		
			iconsInit.interval = setInterval('scalar.iconsInit.checkComplete();',50);
		}
		
		
		
		var img=null, ep=false, str='',icons=new Array(); filterState = 0;
		
		// Ensure icons contains an array of icon names + transforms
		if ( isArray(icon) ) {
			icons=icon;
		} else {		
			icons.push(new Array(icon,0,0,0,1));
		}

		// Get the IMG or SVG node to be replaced
		if ( ev != null ) ev.type != undefined ? img=ev.target : img=ev; 
		
		// Create the SVG icon container, and give it a unique ID
		str += scalar.frag['container'].replace("svgIMG",iconID);
		
		/** ============================ Generate SVG with FILTERS, or without ================================
		
		Options are...
		
		dropShadow: 	Apply a drop shadow to the icon
		
		gaussianBlur:	Apply a blur to the icon
		
		greyScale:	De-saturate the icon
		
		*/
		
		if ( f1 ) {
			
			var uniqueID = 'MyFilter_'+Math.floor(Math.random()*9999999);
			str += '<filter id="'+uniqueID+'" filterUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">';
			
			if (f1[0] == 'dropShadow' ) {
				
				// ===================================== DROP-SHADOW ==================================== 			
				/** Produces a dropshadow of the icon, based on its alpha
					0: filterType		- String:					'dropShadow'
					1: startState		- Int						0 = inactive, null or 1 = active 
					2: shadowBlur		- Number-Float					0 - 20
					3: shadowOffset X	- Number-Int					pixel size
					4: shadowOffset Y	- Number-Int					pixel size
					5: shadowOpacity	- Number-Float					opacity 0 - 1
					6: shadowColor		- Array(h(int),s(float),l(float))		(0-360,0-100,0-100)
					7: filterOffOpacity	- Number-Float					alpha 	0 - 1
					
					e.g. ['dropShadow',.8,9,9,0.8,(90,50,20),.5]
				*/	
			
				// Default filter state is OFF
				filterState = f1[1];
				f1[1]==1 || f1[1]==null ? f1[1]=1 : f1[1]=0;
						
				//Shadow Colour
				var hue=210, sat=10, lum=3;
				if ( f1[5] ) {
					hue = f1[6][0];
					sat = f1[6][1];
					lum = f1[6][2];
				}
				
				var deviation		= f1[2];
				var xOffset 		= f1[3];
				var yOffset 		= f1[4];
				var floodOpacity	= f1[5];
				
				//Set to state 0 (off) if specified		
				if (filterState == 0 ) {
					deviation	= 0;
					xOffset 	= 0;
					yOffset 	= 0;
				}
				
				str += '<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0       0 0 0 0 0       0 0 0 0 0     0 0 0 1 0" result="blackShadow" />';
				str += '<feFlood flood-color="hsl('+hue+','+sat+'%,'+lum+'%)" flood-opacity="'+floodOpacity+'" result="shadowColor"/>';
				str += '<feComposite in2="blackShadow" in="shadowColor" operator="atop" result="shadowMASTER"/>';
				str += '<feGaussianBlur id="'+iconID+'_shadowBlur" in="shadowMASTER" maxDev="'+f1[2]+'" stdDeviation="'+deviation+'" result="shadow1"/>';
				str += '<feOffset id="'+iconID+'_shadowOffset" in="shadow1" maxOffsetX="'+f1[3]+'" maxOffsetY="'+f1[4]+'" dx="'+xOffset+'" dy="'+yOffset+'" result="offsetShadow1"/>';
				str += '<feBlend in="SourceGraphic" in2="offsetShadow1" mode="normal" result="result"/>';
				
			
				
			} else if (f1[0] == 'gaussianBlur' ) {
				// ================================ GAUSSIAN BLUR ====================================
				/** Applies a Guassian Blur to the icon
					0: filterType		- String:					'gaussianBlur'
					1: startState		- Int						0 = inactive, null or 1 = active 
					2: blur			- Number-Float					0 - 20
					3: filterOffOpacity	- Number-Float					alpha 	0 - 1
					
					e.g. ['gaussianBlur',1,6,.5]
				*/	
				
				
				// Default filter state is ON
				f1[1]==1 || f1[1]==null ? f1[1]=1 : f1[1]=0;
				filterState = f1[1];			
				f1[3] ? f1[3]=f1[3] : f1[3]=1;

				var deviation = f1[2];
				var trans = f1[3];
				//Set to state 0 (off) if specified		
				if (filterState == 0 ) {
					deviation = 0;
					trans = 1;
				}
				
				str += '<feGaussianBlur id="'+iconID+'_gaussianBlur" blursize="'+f1[2]+'" in="SourceGraphic" stdDeviation="'+deviation+'" result="pre-result"/>';
				str += '<feColorMatrix id="'+iconID+'_gaussianOpacity" maxTransparency="'+f1[3]+'" type="matrix" in="pre-result" result="result" values="1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+trans+' 0"/>';

				
				
				
			} else if (f1[0] == 'greyScale' ) {				
				// ================================== GREYSCALE ======================================
				/** De-saturates the icon
					0: filterType		- String:					'greyScale'
					1: startState		- Int						0 = inactive, null or 1 = active
					2: maxGreyScale		- float						How much greyscale effect to use, when effect is fully applied
					3: filterOffOpacity	- Number-Float					alpha 	0 - 1
					
					e.g. ['greyScale',1,1,.5]
				*/
				
				// Default filter state is ON
				f1[1]==1 || f1[1]==null ? f1[1]=1 : f1[1]=0;
				filterState = f1[1];	
				f1[3] ? f1[3]=f1[3] : f1[3]=1;
				
				var initGrey 	= f1[2];
				var initTrans 	= f1[3];
				//Set to state 0 (off) if specified		
				if (filterState == 0 ) {
					initGrey 	= 0;
					initTrans 	= 1;
				}
				
				str += '<feColorMatrix id="'+iconID+'_greyScale" type="matrix" in="SourceGraphic" result="grey" values="0.3 0.7 0.015 0 0    0.3 0.7 0.015 0 0    0.3 0.7 0.015 0 0   0 0 0 '+initGrey+' 0"/>';
				str += '<feColorMatrix type="matrix" in="SourceGraphic" result="colour" values="1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 1 0"/>';
				str += '<feComposite in="grey" in2="colour" operator="over" result="pre-result"/>';
				str += '<feColorMatrix id="'+iconID+'_greyScaleOpacity" maxTransparency="'+f1[3]+'" type="matrix" in="pre-result" result="result" values="1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+initTrans+' 0"/>';

				
				
				
			} else if (f1[0] == 'glow' ) {			
				// ====================================== GLOW ======================================
				/** De-saturates the icon
					0: filterType		- String:					'glow'
					1: startState		- Int						0 = inactive, null or 1 = active
					2: maxGlowSize		- float						The glow effects size, in SVG space
					3: filterOffOpacity	- Number-Float					alpha 	0 - 1
					
					e.g. ['glow',1,8,.5]
				*/
				
				// Default filter state is OFF
				f1[1]==1 || f1[1]==null ? f1[1]=1 : f1[1]=0;
				filterState = f1[1];	
				f1[3] ? f1[3]=f1[3] : f1[3]=1;
				
				var glowSize 	= f1[2];
				var initTrans 	= 1;
				//Set to state 0 (off) if specified		
				if (filterState == 0 ) {
					glowSize	= 0;
					initTrans	= f1[3];
				}
				
				str += '<feColorMatrix type="matrix" in="SourceGraphic" result="colour" values="1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 1 0"/>';
				str += '<feGaussianBlur id="'+iconID+'_glow1" glowsize="'+(f1[2]*.2)+'" in="SourceGraphic" stdDeviation="'+(glowSize*.2)+'" result="blur1"/>';
				str += '<feGaussianBlur id="'+iconID+'_glow2" glowsize="'+(f1[2]*.8)+'" in="SourceGraphic" stdDeviation="'+(glowSize*.8)+'" result="blur2"/>';
				str += '<feGaussianBlur id="'+iconID+'_glow3" glowsize="'+(f1[2])+'" in="SourceGraphic" stdDeviation="'+(glowSize)+'" result="blur3"/>';
				str += '<feBlend mode="screen" in="blur1" in2="blur2" result="comp1"/>';
				str += '<feBlend mode="screen" in="comp1" in2="blur3" result="comp2"/>';				
				str += '<feComposite in="SourceGraphic" in2="comp2" operator="over" result="pre-result"/>';
				str += '<feColorMatrix id="'+iconID+'_glowOpacity" maxTransparency="'+f1[3]+'" type="matrix" in="pre-result" result="result" values="1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+initTrans+' 0"/>';

				
				
			} else if (f1[0] == 'keyline' ) {			
				// ====================================== KEYLINE ======================================
				
				/** Produces an keyline of the icon, based on its alpha
					0: filterType		- String:					'keyline'
					1: DefaultState		- Int						0 = inactive, null or 1 = active 
					2: keylineSize		- Number-Float					pixels 	0 - 20
					3: keylineBlur		- Number-Float					blur 	0 - 20
					4: keylineColor		- Array(h(int),s(float),l(float))		(0-360,0-100,0-100)
					5: filterOffOpacity	- Number-Float					alpha 	0 - 1
					
					e.g. ['keyline',1,3,5,(90,50,20),.5]
				*/
				
				// Default filter state is OFF
				f1[1]==1 || f1[1]==null ? f1[1]=1 : f1[1]=0;
				filterState = f1[1];
				
				// Default state OFF alpha = 1
				f1[4] ? f1[4]=f1[4] : f1[4]=1;
				
				
				//Keyline Colour
				var hue=0, sat=100, lum=75;
				if ( f1[4] ) {
					hue = f1[4][0];
					sat = f1[4][1];
					lum = f1[4][2];
				}
				
				var keylineSize 	= f1[2];
				var keylineBlur		= f1[3];
				var initTrans 		= 1;
				var keylineTrans	= 1;
				
				
				//Set to state 0 (off) if specified		
				if (filterState == 0 ) {
					//keylineSize	= 0;
					initTrans	= f1[5];
					keylineTrans	= 0;
				}
				
				str += '<feColorMatrix type="matrix" in="SourceGraphic" result="oBlack" values="0 0 0 0 0    0 0 0 0 0    0 0 0 0 0   0 0 0 1 0"/>';
				str += '<feMorphology id="'+iconID+'_keylineSize" operator="dilate" in="oBlack" keylineSize="'+keylineSize+'" radius="'+keylineSize+'" result="dilate"/>';
				str += '<feFlood flood-color="hsl('+hue+','+sat+'%,'+lum+'%)" flood-opacity="1" result="oColour"/>';
				str += '<feComposite in2="dilate" in="oColour" operator="atop" result="keyline"/>'
				
				str += '<feColorMatrix id="'+iconID+'_keylineAlpha" type="matrix" in="keyline" result="keylineTrans" values="1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+keylineTrans+' 0"/>';
				str += '<feGaussianBlur id="'+iconID+'_keylineBlur" keylineBlur="'+keylineBlur+'" in="keylineTrans" stdDeviation="'+keylineBlur+'" result="keylineBlurred"/>';
				
				str += '<feColorMatrix id="'+iconID+'_keylineSrcAlpha" maxTransparency="'+f1[5]+'" type="matrix" in="SourceGraphic" result="SourceGraphicTrans" values="1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+initTrans+' 0"/>';
				
				str += '<feComposite in="SourceGraphicTrans" in2="keylineBlurred" operator="over" result="result"/>';	
			}
			
			str += '</filter>';
			
			// Create the wrapping transform node
			var transformID = 'trans_'+Math.floor(Math.random()*9999999);			
			str += '<g id="'+transformID+'" transform="rotate(0,50,50),translate(0,0),scale(1)">';
			
			for ( var k=0; k<icons.length; k++) {
				
				var id = (nameSpaceID)	?	nameSpaceID +'_'+icons[k][0]	:	"icon_layer_"+k;
				
				// If a specific set of icon names have been defined, to apply the Filter effect to, only apply to those items
				var filter = '';
				if (icons[k][5] != false ) filter = 'filter="url(#'+uniqueID+')"';
				
				str += '<g id="'+id+'" '+filter+'><g transform="rotate('+icons[k][3]+',50,50),translate('+icons[k][1]+','+icons[k][2]+'),scale('+icons[k][4]+')">'+scalar.frag[icons[k][0]]+'</g></g>';
			}
		}
		else {
			for ( var k=0; k<icons.length; k++) {
				var id = (nameSpaceID)	?	nameSpaceID +'_'+icons[k][0]	:	"icon_layer_"+k;
				str += '<g id="'+id+'" transform="rotate('+icons[k][3]+',50,50),translate('+icons[k][1]+','+icons[k][2]+'),scale('+icons[k][4]+')">'+scalar.frag[icons[k][0]]+'</g>';
			}
		}
		
		str += '</g></svg>';
		
		
		
		// ==================== Generate the SVG ELEMENT ===========================
		var svgNode;
		svgNode = createSVG(str);
		
		svgNode.removeAttribute('width');
		svgNode.removeAttribute('height');
		
		// Make img and svgNode global
		scalar.img 		= img;
		scalar.svgNode 		= svgNode;
		
		// Add this icon to the ALL group
		if (groups['all'].indexOf(iconID) < 0) { 
			groups['all'].push(iconID);
		} else {
			console.log('iconID "'+iconID+'" has already been used, please pick a unique iconID per SVG icon');
			return;
		}
		
		// Create any new groups
		if ( groupID != '' ) {
			if ( groups[''+groupID] == undefined ) {
				groups[''+groupID] = new Array();
				groups[''+groupID].push(iconID);
			} else {
				groups[''+groupID].push(iconID);
			}
		}
		
		// Set the groupID & filters attributed, if required.
		if ( f1 ) { 
			svgNode.setAttribute('filtertype',f1[0]);
			svgNode.setAttribute('filterstate',filterState);
		}
		

		// Copy the img attributes to the new SVG node to replace the IMG node with the SVG node
		copyElementAttributes();
		
		try{
			img.parentNode.replaceChild(svgNode, img);
		} catch(e){}
		
		scalar.iconsInit.counter = 0;
	}

	
	// Checks to see if a MouseOver event TRULY is happening, or is based on a movement into a CHILD of that element (so not REALLY a MouseOver per se)
	var ent = function(e,t){
		rt = e.relatedTarget || e.fromElement;
		et = t;
		
		if (!rt) return {state:'in'};
		
		for (var i=0; i<100; i++ ) {
	
			if ( et === rt ) {
				//console.log('within');
				return {state:'in'};
			} else if ( rt.nodeName == 'HTML' ) {
				return {state:'entering'};
			}
			
			rt = rt.parentNode;	
		}
	}
	
	// Checks to see if a MouseOut event TRULY is happening, or is based on a movement out of and into a CHILD of that element (so not REALLY a MouseOut per se)
	var ext = function(e,t){
		rt = e.relatedTarget || e.toElement;
		et = t;
		
		if (!rt) return {state:'in'};
		
		for (var i=0; i<100; i++ ) {
			//console.log(rt);
			if ( et === rt ) {
				//console.log('within');
				return {state:'in'};
			} else if ( rt.nodeName == 'HTML' ) {
				//console.log('Exiting: '+et.id);
				return {state:'exiting'}; 
			}
			
			rt = rt.parentNode;
		}
	}
	
	var findNode = function(e,nodeName){
		rt = e.target;
		
		for (var i=0; i<100; i++ ) {
			if ( rt.nodeName == nodeName ) {
				return rt;
			} else if ( rt.nodeName == 'HTML' ) {
				return false; 
			}
			rt = rt.parentNode;
		}
	}
	
	
	// =========================================================== Toggles the Filter applied to an icon, ON/OFF =========================================================
	var toggleFilter = function(e,t,iconID,setAs,speed) {

		var src		= null;	
		var enter 	= 'within';
		var exit 	= 'within';
		
		//console.log(event.target.nodeName);
		
		if (typeof iconID == 'string') {
			src = document.getElementById(iconID);
		} else if ( this != window && this != null && this != 'undefined' ) {
			src = this;	
		} else if ( typeof t == 'object' ) {
			src = t;
		}
		
		if ( !src ) return;
		/*
		if( event ) {
			if ( event.type == 'click' ) {
				if ( event.target.nodeName == 'svg' ) {
					src = event.target;
				} else {
					src = findNode(event,'svg');
				}
			}
		}
		*/
		
		//Stop the Toggle, IF the call was made from toggleGroupFilters and current Filterstate matches desired state		
		if ( !e && !t ) {
			if ( src.getAttribute('filterstate') == setAs ) return;
		}
		
		if ( e ) {
			if ( e.data != null ) setAs = e.data.setAs;
			
			var callee = null;	
				
			if ( typeof t == 'object' ) {
				callee = t;
			} else if (typeof iconID == 'string') {
				callee = document.getElementById(iconID);
			} else if ( this != window && this != null && this != 'undefined' ) {
				callee = this;	
			} 
		
			if (e.type == 'mouseover' ) {
				enter = ent(e,callee);				
				if ( enter.state == 'in' ) return;
			}
			
			if (e.type == 'mouseout' ) {
				exit = ext(e,callee);
				if ( exit.state == 'in' ) return;
			}
		}
		
		//Store target, for later retrevial in Anim funcs
		var ival = ''+Math.floor(Math.random()*999999999);
		target[ival] = src;
		
		// Ensure that setAs is either applied as passed in, or set to be opposite of current icon state.
		if ( setAs == null || setAs == 'undefined' ) {
			setAs = 1;
			if ( target[ival].getAttribute('filterstate') == 1 ) setAs = 0;
		} else if ( setAs != 0 && setAs != 1 ) {
			setAs = 1;
			if ( target[ival].getAttribute('filterstate') == 1 ) setAs = 0;
		}
		
		
		
		if ( target[ival].getAttribute('filtertype') == 'keyline' ) {

			// ================================ KEYLINE EFFECT =================================
			
			//set Default speed for each effect
			speed ? speed=speed : speed = .25;
		
			if ( setAs == 0 ) {		
				keylineAnim_IN = function(iv,srcID,s) {

					if ( val[iv] < 0 )  {
						target[iv].setAttribute('filterstate','0');
						clearInterval(Interval[iv]);
						delete Interval[iv];
						return;
					}
				
					alpha1 = 1-(jsBezier.pointOnCurve([{x:0,y:0}, {x:.5,y:0}, {x:.5,y:1}, {x:1,y:1}], val[iv]).y); //alpha = 1-((1-mt)*(1-val[iv]));
					document.getElementById(srcID+"_keylineAlpha").setAttribute('values','1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+(alpha1)+' 0');

					var mt = document.getElementById(srcID+"_keylineSrcAlpha").getAttribute('maxtransparency')*1;
					alpha2 = 1-((1-mt)*(jsBezier.pointOnCurve([{x:0,y:0}, {x:.5,y:0}, {x:.5,y:1}, {x:1,y:1}], val[iv]).y)); //alpha = 1-((1-mt)*(1-val[iv]));
					document.getElementById(srcID+"_keylineSrcAlpha").setAttribute('values','1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+(alpha2)+' 0');

					
					val[iv] = val[iv] - s;					
				}
				
				val[ival] = 1;
				Interval[ival] = setInterval("keylineAnim_IN('"+ival+"','"+src.id+"',"+speed+");",20);

			} else {
				keylineAnim_OUT = function(iv,srcID,s) {
					
					if ( val[iv] > 1 ) {
						target[iv].setAttribute('filterstate','1');
						clearInterval(Interval[iv]);
						delete Interval[iv];
						return;
					}
						
					alpha1 = (1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.5,y:0}, {x:.5,y:1}, {x:1,y:1}], val[iv]).y); //alpha = mt+((1-mt)*(val[iv]));
					document.getElementById(srcID+"_keylineAlpha").setAttribute('values','1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+(alpha1)+' 0');

					var mt = document.getElementById(srcID+"_keylineSrcAlpha").getAttribute('maxtransparency')*1;
					alpha2 = mt+((1-mt)*(1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.5,y:0}, {x:.5,y:1}, {x:1,y:1}], val[iv]).y)); //alpha = mt+((1-mt)*(val[iv]));
					document.getElementById(srcID+"_keylineSrcAlpha").setAttribute('values','1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+(alpha2)+' 0');
					
					val[iv] = val[iv] + s;
				}

				val[ival] = 0;
				Interval[ival] = setInterval("keylineAnim_OUT('"+ival+"','"+src.id+"',"+speed+");",20);
			}
			
			
			
			
		} else if ( target[ival].getAttribute('filtertype') == 'dropShadow' ) {

			// ================================ DROP-SHADOW EFFECT =================================
			
			//set Default speed for each effect
			speed ? speed=speed : speed = .25;
		
			if ( setAs == 0 ) {		
				shadowAnim_IN = function(iv,srcID,s) {
					
					if ( val[iv] < 0 )  {
						target[iv].setAttribute('filterstate','0');
						clearInterval(Interval[iv]);
						delete Interval[iv];
						return;
					}
					
					dev = document.getElementById(srcID+"_shadowBlur").getAttribute('maxdev')*(1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.25,y:0}, {x:.25,y:1}, {x:1,y:1}], val[iv]).y); //dev = document.getElementById(srcID+"_shadowBlur").getAttribute('maxdev')*(val[iv]);
					document.getElementById(srcID+"_shadowBlur").setAttribute('stdDeviation',dev);
					
					offX = document.getElementById(srcID+"_shadowOffset").getAttribute('maxoffsetx')*(1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.25,y:0}, {x:.25,y:1}, {x:1,y:1}], val[iv]).y); //offX = document.getElementById(srcID+"_shadowOffset").getAttribute('maxoffsetx')*(val[iv]);
					document.getElementById(srcID+"_shadowOffset").setAttribute('dx',offX);
					
					offY = document.getElementById(srcID+"_shadowOffset").getAttribute('maxoffsety')*(1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.25,y:0}, {x:.25,y:1}, {x:1,y:1}], val[iv]).y); //offY = document.getElementById(srcID+"_shadowOffset").getAttribute('maxoffsety')*(val[iv]);
					document.getElementById(srcID+"_shadowOffset").setAttribute('dy',offY);

					val[iv] = val[iv] - s;					
				}
				
				val[ival] = 1;
				Interval[ival] = setInterval("shadowAnim_IN('"+ival+"','"+src.id+"',"+speed+");",20);

			} else {
				shadowAnim_OUT = function(iv,srcID,s) {
					
					if ( val[iv] > 1 ) {
						target[iv].setAttribute('filterstate','1');
						clearInterval(Interval[iv]);
						delete Interval[iv];
						return;
					}
					
					dev = document.getElementById(srcID+"_shadowBlur").getAttribute('maxdev')*(1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.25,y:0}, {x:.25,y:1}, {x:1,y:1}], val[iv]).y); //dev = document.getElementById(srcID+"_shadowBlur").getAttribute('maxdev')*(val[iv]);
					document.getElementById(srcID+"_shadowBlur").setAttribute('stdDeviation',dev);
					
					offX = document.getElementById(srcID+"_shadowOffset").getAttribute('maxoffsetx')*(1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.25,y:0}, {x:.25,y:1}, {x:1,y:1}], val[iv]).y); //offX = document.getElementById(srcID+"_shadowOffset").getAttribute('maxoffsetx')*(val[iv]);
					document.getElementById(srcID+"_shadowOffset").setAttribute('dx',offX);
					
					offY = document.getElementById(srcID+"_shadowOffset").getAttribute('maxoffsety')*(1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.25,y:0}, {x:.25,y:1}, {x:1,y:1}], val[iv]).y); //offY = document.getElementById(srcID+"_shadowOffset").getAttribute('maxoffsety')*(val[iv]);
					document.getElementById(srcID+"_shadowOffset").setAttribute('dy',offY);
					
					val[iv] = val[iv] + s;
				}

				val[ival] = 0;
				Interval[ival] = setInterval("shadowAnim_OUT('"+ival+"','"+src.id+"',"+speed+");",20);
			}
			
			
			
			
		} else if( target[ival].getAttribute('filtertype') == 'gaussianBlur' ) {
			
			// ================================ BLUR EFFECT =================================
			
			//set Default speed for each effect
			speed ? speed=speed : speed = .25;
			
			if ( setAs == 0 ) {	
				blurAnim_OUT = function(iv,srcID,s) {
					var mt = document.getElementById(srcID+"_gaussianOpacity").getAttribute('maxtransparency')*1;
					
					if ( val[iv] < 0 )  {
						target[iv].setAttribute('filterstate','0');
						clearInterval(Interval[iv]);
						delete Interval[iv];
						return;
					}
					
					dev = 1*(1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.5,y:0}, {x:.5,y:1}, {x:1,y:1}], val[iv]).y); //dev = 1*(val[iv]);
					document.getElementById(srcID+"_gaussianBlur").setAttribute('stdDeviation',dev*document.getElementById(target[iv].id+"_gaussianBlur").getAttribute('blursize') );
					
					alpha = mt+((1-mt)*(jsBezier.pointOnCurve([{x:0,y:0}, {x:.5,y:0}, {x:.5,y:1}, {x:1,y:1}], val[iv]).y)); //alpha = mt+((1-mt)*(1-val[iv]));
					document.getElementById(srcID+"_gaussianOpacity").setAttribute('values','1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+(alpha)+' 0');
					
					val[iv] = val[iv] - s;
				}
				
				val[ival] = 1;
				Interval[ival] = setInterval("blurAnim_OUT('"+ival+"','"+src.id+"',"+speed+");",20);
		
			} else {
				blurAnim_IN = function(iv,srcID,s) {
					var mt = document.getElementById(srcID+"_gaussianOpacity").getAttribute('maxtransparency')*1;
					
					if (val[iv] > 1 )  {
						target[iv].setAttribute('filterstate','1');
						clearInterval(Interval[iv]);
						delete Interval[iv];
						return;
					}
					
					dev = 1*(1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.5,y:0}, {x:.5,y:1}, {x:1,y:1}], val[iv]).y); //dev = 1*(val[iv]);
					document.getElementById(srcID+"_gaussianBlur").setAttribute('stdDeviation',dev*document.getElementById(target[iv].id+"_gaussianBlur").getAttribute('blursize') );
					
					alpha = 1-(1-mt)*(1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.5,y:0}, {x:.5,y:1}, {x:1,y:1}], val[iv]).y); //alpha = 1-((1-mt)*(val[iv]));
					document.getElementById(srcID+"_gaussianOpacity").setAttribute('values','1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+(alpha)+' 0');
										
					val[iv] = val[iv] + s;
				}
			
				val[ival] = 0;
				Interval[ival] = setInterval("blurAnim_IN('"+ival+"','"+src.id+"',"+speed+");",20);
			}
			
			
			
		} else if ( target[ival].getAttribute('filtertype') == 'greyScale' ) {
			
			// ================================ GREYSCALE EFFECT =================================
			
			//set Default speed for each effect
			speed ? speed=speed : speed = .25;	
		
			if ( setAs == 0 ) {
				greyAnim_OUT = function(iv,srcID,s) {
					
					if ( val[iv] < 0 )  {
						target[iv].setAttribute('filterstate','0');
						clearInterval(Interval[iv]);
						delete Interval[iv];
						return;
					}
					var mt = document.getElementById(srcID+"_greyScaleOpacity").getAttribute('maxtransparency')*1;
					
					alpha1 = (1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.0,y:0}, {x:1,y:1}, {x:1,y:1}], val[iv]).y); //alpha1 = (val[iv]);
					document.getElementById(srcID+"_greyScale").setAttribute('values','0.3 0.7 0.015 0 0    0.3 0.7 0.015 0 0    0.3 0.7 0.015 0 0   0 0 0 '+alpha1+' 0');
					
					alpha2 = mt+((1-mt)*(jsBezier.pointOnCurve([{x:0,y:0}, {x:.0,y:0}, {x:1,y:1}, {x:1,y:1}], val[iv]).y)); //alpha2 = mt+((1-mt)*(1-val[iv]));
					document.getElementById(srcID+"_greyScaleOpacity").setAttribute('values','1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+(alpha2)+' 0');
										
					val[iv] = val[iv] - s;
				}
			
				val[ival] 	= 1;
				Interval[ival] 	= setInterval("greyAnim_OUT('"+ival+"','"+src.id+"',"+speed+");",20);
			
			} else {
				greyAnim_IN = function(iv,srcID,s) {
					
					if ( val[iv] > 1 )  {
						target[iv].setAttribute('filterstate','1');
						clearInterval(Interval[iv]);
						delete Interval[iv];
						return;
					}

					var mt = document.getElementById(srcID+"_greyScaleOpacity").getAttribute('maxtransparency')*1;
						
					alpha1 = (1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.0,y:0}, {x:1,y:1}, {x:1,y:1}], val[iv]).y); //alpha1 = (val[iv]);
					document.getElementById(srcID+"_greyScale").setAttribute('values','0.3 0.7 0.015 0 0    0.3 0.7 0.015 0 0    0.3 0.7 0.015 0 0   0 0 0 '+alpha1+' 0');
					
					alpha2 = 1-(1-mt)*(1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.0,y:0}, {x:1,y:1}, {x:1,y:1}], val[iv]).y); //alpha2 = 1-((1-mt)*val[iv]);
					document.getElementById(srcID+"_greyScaleOpacity").setAttribute('values','1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+(alpha2)+' 0');
										
					val[iv] = val[iv] + s;
				}
			
				val[ival] 	= 0;
				Interval[ival] 	= setInterval("greyAnim_IN('"+ival+"','"+src.id+"',"+speed+");",20);
			}
			
			
			
		} else if ( target[ival].getAttribute('filtertype') == 'glow' ) {
			
			// ================================ GLOW EFFECT =================================
			
			//set Default speed for each effect
			speed ? speed=speed : speed = .25;
			
			if ( setAs == 0 ) {
				glowAnim_OUT = function(iv,srcID,s) {
					
					if ( val[iv] < 0 )  {
						target[iv].setAttribute('filterstate','0');
						clearInterval(Interval[iv]);
						delete Interval[iv];
						return;
					}
					
					
					
					if ( val[iv] < 0 ) val[iv] = 0;
						
					dev = (1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.5,y:0}, {x:.5,y:1}, {x:1,y:1}], val[iv]).y); //dev = (val[iv]);
					document.getElementById(srcID+"_glow1").setAttribute('stdDeviation', dev*document.getElementById(srcID+"_glow1").getAttribute('glowsize') );
					document.getElementById(srcID+"_glow2").setAttribute('stdDeviation', dev*document.getElementById(srcID+"_glow2").getAttribute('glowsize') );
					document.getElementById(srcID+"_glow3").setAttribute('stdDeviation', dev*document.getElementById(srcID+"_glow3").getAttribute('glowsize') );
					
					var mt = document.getElementById(srcID+"_glowOpacity").getAttribute('maxtransparency')*1;
					alpha = 1-((1-mt)*(jsBezier.pointOnCurve([{x:0,y:0}, {x:.5,y:0}, {x:.5,y:1}, {x:1,y:1}], val[iv]).y)); //alpha = 1-((1-mt)*(1-val[iv]));
					document.getElementById(srcID+"_glowOpacity").setAttribute('values','1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+(alpha)+' 0');
				
					val[iv] = val[iv] - s;
				}
			
				val[ival] 	= 1;
				Interval[ival] 	= setInterval("glowAnim_OUT('"+ival+"','"+src.id+"',"+speed+");",20);
				
			
			} else {	
				glowAnim_IN = function(iv,srcID,s) {
					
					if ( val[iv] > 1 )  {
						target[iv].setAttribute('filterstate','1');
						clearInterval(Interval[iv]);
						delete Interval[iv];
						return;
					}
					
					dev = (1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.5,y:0}, {x:.5,y:1}, {x:1,y:1}], val[iv]).y); //dev = (val[iv]);
					document.getElementById(srcID+"_glow1").setAttribute('stdDeviation', dev*document.getElementById(srcID+"_glow1").getAttribute('glowsize'));
					document.getElementById(srcID+"_glow2").setAttribute('stdDeviation', dev*document.getElementById(srcID+"_glow2").getAttribute('glowsize'));
					document.getElementById(srcID+"_glow3").setAttribute('stdDeviation', dev*document.getElementById(srcID+"_glow3").getAttribute('glowsize'));
					
					var mt = document.getElementById(srcID+"_glowOpacity").getAttribute('maxtransparency')*1;
					alpha = mt+((1-mt)*(1-jsBezier.pointOnCurve([{x:0,y:0}, {x:.5,y:0}, {x:.5,y:1}, {x:1,y:1}], val[iv]).y)); //alpha = mt+((1-mt)*(val[iv]));
					document.getElementById(srcID+"_glowOpacity").setAttribute('values','1 0 0 0 0    0 1 0 0 0    0 0 1 0 0   0 0 0 '+(alpha)+' 0');
				
					val[iv] = val[iv] + s;
				}
			
				val[ival] 	= 0;
				Interval[ival] 	= setInterval("glowAnim_IN('"+ival+"','"+src.id+"',"+speed+");",20);
				
			
			}
			
		}
		
		//console.log(Interval);
	}
	
	
	var toggleGroupFilters = function(groupID,state,delayMax,speed) {
		
		/*****************************************************************************************************
		
		Toggles sets of icons defined via groupIDs
		
		By default, ALL icons belong to the 'all' group
		
		to limit the effect to a subset of icons, add it to group and pass it as the groupID argument here.
		
		VARS:
		
		groupID : the group of icons to toggle
		delayMax: How much of a random delay to apply to each icon, in ms i.e. 1000 = 1 second max
		
		******************************************************************************************************/
		
		for(i=0; i< groups[''+groupID].length; i++) {
			
			// Standard is no random delay
			delayMax ? delayMax=delayMax : delayMax=0;
			
			var g = ''+Math.floor(Math.random()*9999999999);
			var r = ''+Math.floor(Math.random()*delayMax);
			
			group[g] = function(groupID,i,state) {
				toggleFilter(null,null,groups[''+groupID][i],state,speed);
			}
			
			window.setTimeout("scalar.group["+g+"]('"+groupID+"','"+i+"',"+state+");",r);
			
		}
		
	}
	
	var gallery = function() {
		console.log('Magic!');
	}
	
	// Properties and Methods to expose
	return {
		/** VARS */
		frag:frag, 					// The SVG fragments
		group:group, 					// The groups that ICONS belong to
		iconsInit:iconsInit,				// Drawing complete callback vars
		
		/** FUNCS */
		icon:icon, 					// Function to replace an IMG node, with an SVG node
		toggleFilter:toggleFilter,			// Function Toggle the state of a single icon
		toggleGroupFilters:toggleGroupFilters, 		// Function Toggle whole GROUPS of icons Filter states, uses toggleFilter
		gallery:gallery					// Function to display all icon fragments in a window
	}
	
})()




