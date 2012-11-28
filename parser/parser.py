import xml.etree.cElementTree as ET
import sqlite3 as lite
import datetime
import time
import sys

filename='snippet.xml'
prefix='{http://www.mediawiki.org/xml/export-0.8/}'

con = lite.connect('development.sqlite3')

cur = con.cursor()

for event, elem in ET.iterparse(filename):
	if elem.tag == prefix+"title":
		now = datetime.datetime.now()
		sql ='INSERT INTO "keywords" ("created_at", "name", "updated_at", "wiki_page") VALUES (%s, %s, %s, %s)' % (time.mktime(now.timetuple()), '"'+elem.text+'"', time.mktime(now.timetuple()), '"randomepage"')
		print sql
		cur.execute(sql)
	elem.clear()

print "Done updating dB"

con.commit();
con.close();

