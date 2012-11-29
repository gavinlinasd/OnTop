# import xml.etree.cElementTree as ET
from lxml import etree as ET
import sqlite3 as lite
from datetime import datetime
import time
import re
import sys

# function for inserting keyword
def sql_insert(keyword):
	insert_keyword = 'INSERT INTO "keywords" ("created_at", "name", "updated_at", "wiki_page") VALUES '
	timestamp = time.mktime(datetime.now().timetuple()) # timestamp
	sql = insert_keyword +'(%s, %s, %s, %s)' % (timestamp , '"'+keyword+'"', timestamp, '"randomepage"')
	print sql
	cur.execute(sql)



filename='snippet-1.xml'
prefix='{http://www.mediawiki.org/xml/export-0.8/}'
total=0;

#bracket matching
linkmatch=re.compile('(\[\[)([)(\s,\w,:]*?)(\]\])')

#seealsomatch=re.compile('==\s?See also==..*?==',re.DOTALL)
seealsomatch=re.compile('==\s?See also\s?==..*?==',re.DOTALL)
seealsomatch_1=re.compile('==\s?See also\s?==..*?\n\n',re.DOTALL)
externalmatch=re.compile('==\s?External..*]]',re.DOTALL)

# For database
con = lite.connect('development.sqlite3')
cur = con.cursor()

# title_set = set([])
title_set = {}

for event, elem in ET.iterparse(filename,events=('end',),tag=prefix+'page'):
#		sql_insert(elem.text)

	# finding keyword
	title = elem.find(prefix+'title').text
	redirect = elem.find(prefix+'redirect')
	if redirect != None:
		title = redirect.get('title')
	
	if title not in title_set:
		# matching links
		text = elem.find(prefix+'revision').find(prefix+'text')
		category = []
		if text != None and redirect == None:

			# Only match links inside <see also> and <category>
			seealso = seealsomatch.search(text.text)
			if seealso==None:
				seealso = seealsomatch_1.search(text.text)
			external = externalmatch.search(text.text)

			# See also
			if seealso!=None:
				links = linkmatch.findall(seealso.group(0))
				for l in links:
					category.append(l[1].encode('ascii','ignore'))

			# Category
			if external!=None:
				links = linkmatch.findall(external.group(0))
				for l in links:
					if re.match("Category:", l[1])!=None:
						category.append(l[1].encode('ascii','ignore')[9:])

			# If not enough useful info, grab first 10 links
			# in the text
			if seealso==None or external==None:
				links = linkmatch.findall(text.text)
				count=0
				for l in links:
					category.append(l[1].encode('ascii','ignore'))
					count+=1
					if count==10:
						break
					

			title_set[title]=category
			#print category


	elem.clear()

print len(title_set)
for k,v in title_set.iteritems():
	total+=len(v)
	print k,len(v)

print
print "Average links: ", total/len(title_set)
print "Done processing. Now accepting queries.."

while True:
	word = raw_input("Please enter keyword: ")
	if word in title_set:
		print title_set[word]
	else:
		print "No such keyword."
	

con.commit()
con.close()

