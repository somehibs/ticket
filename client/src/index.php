<?php
    $path = rtrim(str_replace('\\','/',dirname($_SERVER['PHP_SELF'])), '/');
    $url = ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ? 'https://' : 'http://' ) . $_SERVER['HTTP_HOST'] . $path;
?>
<!doctype html>
<html class="no-js" lang="">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width">

        <title>Tripticket</title>

        <link rel="stylesheet" href="<?=$url ?>/css/main.css">
        <link rel="icon" type="image/x-icon" href="<?=$url ?>/images/icon.png">
    </head>
    <body>
	<div id="spinner"></div>
	<div id="loading1" style="text-align: center;margin-top:50px;">Please wait, loading 2.2MB site...</div>
	<div id="loading2" style="text-align: center;margin-top:50px;">(subsequent loads for this version will be much faster)</div>
	<script src="<?=$url ?>/js/spinner.js"></script>
        <div id="app"></div>

        <script>
            root = "<?=$url ?>";
            apiRoot = '<?=$url ?>/api';
            globalIndexPath = "<?=$path ?>";
        </script>
        <?php if (preg_match('~MSIE|Internet Explorer~i', $_SERVER['HTTP_USER_AGENT']) || (strpos($_SERVER['HTTP_USER_AGENT'], 'Trident/7.0; rv:11.0') !== false)): ?>
          <script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=String.prototype.startsWith,Array.from,Array.prototype.fill,Array.prototype.keys,Array.prototype.find,Array.prototype.findIndex,Array.prototype.includes,String.prototype.repeat,Number.isInteger,Promise&flags=gated"></script>
        <?php endif; ?>
        <script defer src="<?=$url ?>/js/main.js"></script>
    </body>
</html>
