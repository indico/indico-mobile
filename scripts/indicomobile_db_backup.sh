#!/bin/bash

DEST=$1
date=`date +%Y-%m-%d-%H-%M-%S`
backup_dir='/opt/indicomobile/backups'
mongodump -d indicomobile
tar -zcvf $backup_dir/indicomobile-$date.tar.gz dump/
rm -rf dump
mv $backup_dir/indicomobile-$date.tar.gz $DEST
