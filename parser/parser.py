# import xml.etree.cElementTree as ET
from lxml import etree as ET
import sqlite3 as lite
from datetime import datetime
import time
import sys

# function for inserting keyword
def sql_insert(keyword):
	insert_keyword = 'INSERT INTO "keywords" ("created_at", "name", "updated_at", "wiki_page") VALUES '
	timestamp = time.mktime(datetime.now().timetuple()) # timestamp
	sql = insert_keyword +'(%s, %s, %s, %s)' % (timestamp , '"'+keyword+'"', timestamp, '"randomepage"')
	print sql
	cur.execute(sql)

filename='snippet.xml'
prefix='{http://www.mediawiki.org/xml/export-0.8/}'

# For database
con = lite.connect('development.sqlite3')
cur = con.cursor()

title_set = set([])

for event, elem in ET.iterparse(filename,events=('end',),tag=prefix+'page'):
#		sql_insert(elem.text)

	title = elem.find(prefix+'title').text
	redirect = elem.find(prefix+'redirect')
	if redirect != None:
		title = redirect.get('title')
	
	if title not in title_set:
		title_set.add(title)

	print title
	elem.clear()

print len(title_set)
print "Done updating dB"


con.commit()
con.close()

