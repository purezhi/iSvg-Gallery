<?php

$ua = getBrowser(); // 取得浏览器信息
$name = $ua["name"]; // 浏览器名称
$version = $ua["version"]; // 浏览器版本

if(($name == BROWSER_IE && $version >= 9) ||
        ($name == BROWSER_FIREFOX && $version >= 3) ||
        ($name == BROWSER_SAFARI && $version >= 4) ||
        ($name == BROWSER_CHROME && $version >= 10)) {
    include("index_common.html");
    
} else if($name == BROWSER_OPERA && $version > 10) {
    include("index_opera.html");
    
} else if($name == BROWSER_IE && $version >= 7) {
    include("index_plugin.html");
    
} else {
    include("photo.html");
    
}

?>
