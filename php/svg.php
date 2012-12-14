<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');
error_reporting(1);

/*		SVG Fragment Compiler
		
		Chris Thomas
		
		16/11/2012
*/

// Reads in all files in a folder and stores in an array
function getDirectoryList ($directory) {
	
	$results = array();
	$handler = opendir($directory);
	while ($file = readdir($handler)) {
		
		if ($file != "." && $file != "..") {
		$results[] = $file;
		}
		
	}
	closedir($handler);
	sort($results);
	return $results;
}


$svgFragments		= SITE_ROOT.'/scalar/media/svg_fragments';
$myFile_JS_Folder	= SITE_ROOT.'/scalar/media/svg_compiled';
$myFile_JS 		= $myFile_JS_Folder.'/svg_fragments.js';
$fragmentFolders 	= getDirectoryList($svgFragments);



/** ==================================================== Check if a compiled fragment file exists =================================================== */
//Check if a compiled fragment file exists
if (file_exists($myFile_JS)) {
	
	$compiledFileExists = true;
	
	//Check if any of the fragment files are newer than it
	$newerFragmentsExists = false;
	$fragmentFileDate = filectime($myFile_JS);
	
	foreach( $fragmentFolders as $folder) {
		if ( substr($folder, 0,1) != '.' ) {
			
			$frgmnts = getDirectoryList ( $svgFragments.'/'.$folder );
			
			// Check the date of each file, vs the compiled files date
			foreach( $frgmnts as $fragKey => $frag) {
				if ( substr($frag, 0,1) != '.' ) {
					//echo "<br>".$svgFragments.'/'.$folder.'/'.$frag;
					if ( filectime($svgFragments.'/'.$folder.'/'.$frag) > filectime($myFile_JS) ) $newerFragmentsExists = true;
				}
			}
		}
	}
}


/** ================================ Write the .js Fragment file, IF it does not exist, or a newer Fragment file is found =================================== */
if ( !file_exists($myFile_JS) || $newerFragmentsExists ) {
	echo 'newer files exists';
		// Stamp the SVG code
	$svg_js  = "\n".'/* ========= WWW SVG GEN =========*/'."\n\n";
	
	foreach( $fragmentFolders as $folder) {
		if ( substr($folder, 0,1) != '.' ) {
			
			$frgmnts = getDirectoryList ( $svgFragments.'/'.$folder );
			
			// Add each SVG fragment to the two objects
			foreach( $frgmnts as $fragKey => $frag) {
				if ( substr($frag, 0,1) != '.' ) {
					
					$fragName = str_replace('.svg','',$frag);
					$file = file_get_contents($svgFragments.'/'.$folder.'/'.$frag);
					$file = str_replace("\n",'',$file);
					$file = str_replace("\r",'',$file);
					$file = str_replace("\t",'',$file);
					
					$svg_js .= "scalar.frag['$fragName'] = '$file';"."\n";
				}
			}
		}
	}
	
	$svg_js .= "\n";	
	// Write the .js SVG file to disk
	$fh = fopen($myFile_JS, 'w') or die("can't open file, please ensure folder owner and perms allow webserver to write to ".$myFile_JS_Folder.' and its contents...');
	fwrite($fh, $svg_js);
	fclose($fh);
}

?>
