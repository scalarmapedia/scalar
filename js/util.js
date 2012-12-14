	
	
	
function isArray(obj) {
	return (obj && obj.constructor.toString().indexOf("Array") > -1)?true:false;
}


function setMenuState() {
	var s = "#nav_"+localStorage["currentPage"];
	console.log(s);
	$(s).addClass("selected");	
}

function showScalarLogo() {
	if ( window.name == '0' ) {
		scalar.toggleFilter(null,null,"scalarLogo",1,.03);
	} else {
		scalar.toggleFilter(null,null,"scalarLogo",1,1);
		logoActive = 1;
	}
	window.name = '1';
}

function scalarSetEvents() {
	$("[id*=hover1_]").mouseover( {setAs:1}, scalar.toggleFilter );
	$("[id*=hover1_]").mouseout( {setAs:0}, scalar.toggleFilter );
	
	$("[id*=hover0_]").mouseover( {setAs:0}, scalar.toggleFilter );
	$("[id*=hover0_]").mouseout( {setAs:1}, scalar.toggleFilter );
	
	$("[id*=click_]").click( scalar.toggleFilter );		
}
		
function setupPage(){
	
	setTimeout("showScalarLogo();",200);
	
	if( localStorage ) {
		setMenuState();
	}
}

