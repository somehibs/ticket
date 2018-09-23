# improve buildscript, take arg for client or server
# server only copies $OUTPUT_DIR/api and doesn't overwrite config.php

BUILD_SERVER=1
COPY=1
TARGET="dev"

OUTPUT_DIR="build"
rm -r $OUTPUT_DIR
mkdir $OUTPUT_DIR
## enter any dir to make any cd work
if [[ $BUILD_CLIENT == 1 ]]; then
	echo "1/3 Building frontend..."
	cd client
	gulp prod --api
	rm build/index.html
	cd ..
fi
if [[ $BUILD_SERVER == 1 ]]; then
	echo "2/3 Creating $OUTPUT_DIR/api"
	mkdir $OUTPUT_DIR/api
	cp server/index.php $OUTPUT_DIR/api
	cp server/.htaccess $OUTPUT_DIR/api
	cp server/composer.json $OUTPUT_DIR/api
	cp server/composer.lock $OUTPUT_DIR/api
	cp -R server/controllers $OUTPUT_DIR/api
	cp -R server/data $OUTPUT_DIR/api
	cp -R server/libs $OUTPUT_DIR/api
	cp -R server/models $OUTPUT_DIR/api
	cp -R server/vendor $OUTPUT_DIR/api
#	mkdir $OUTPUT_DIR/api/files
#	touch $OUTPUT_DIR/api/files/.keep
#	echo -n > $OUTPUT_DIR/api/config.php
	chmod -R 755 $OUTPUT_DIR/api
fi
if [[ $COPY == 1 ]]; then
	if [[ -z $TARGET ]]; then
		echo "TARGET is undefined."
	fi
	echo "Copying api to $TARGET"
	cp ../$TARGET/api/config.php ./
	rm -rf ../$TARGET/api
	cp -R $OUTPUT_DIR/api/ ../$TARGET/api
	cp ./config.php ../$TARGET/api
fi
if [[ $BUILD_ZIP == 1 ]]; then
	echo "3/3 Generating zip..."
	cd client/build
	zip opensupports_dev.zip index.php
	zip -u opensupports_dev.zip .htaccess
	zip -u opensupports_dev.zip css/main.css
	zip -u opensupports_dev.zip js/main.js
	zip -ur opensupports_dev.zip fonts
	zip -ur opensupports_dev.zip images
	mv opensupports_dev.zip ../..
	cd ../..
	zip -ur opensupports_dev.zip $OUTPUT_DIR/api
	rm -rf dist
	mkdir dist
	mv opensupports_dev.zip dist
	rm -rf $OUTPUT_DIR/api
fi
