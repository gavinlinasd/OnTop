# import xml.etree.cElementTree as ET
from lxml import etree as ET
import sqlite3 as lite
from datetime import datetime
import time
import re
import sys


# For database
con = lite.connect('test.sqlite3')
cur = con.cursor()

# General global
filename='snippet.xml'
prefix='{http://www.mediawiki.org/xml/export-0.8/}'



################## SQL Operations ##################

def keyword_insert(keyword):
	# function for inserting keyword
	sql='INSERT INTO "keywords" ("created_at", "updated_at", "name", "display_name",  "wiki_page") VALUES (?, ?, ?, ?, ?)'
	timestamp = time.mktime(datetime.now().timetuple()) # timestamp
	# page = "http://en.wikipedia.org/wiki/"+keyword.replace(' ','_') # construct wikipage
	page = ""
	cur.execute(sql, (timestamp, timestamp, keyword.lower(), keyword, page))
	con.commit()

def keyword_query(keyword):
	# check for the existence of the keyword
	# keyword are not guarentee to be normalized before calling
	sql = 'SELECT "keywords".* FROM "keywords" WHERE "keywords"."name"= ? LIMIT 1'
	cur.execute(sql,[keyword.lower()])
	return cur.fetchone()

def friend_query(keyword_id):
	# return the list of friends with id=keyword_id
	sql='SELECT "keywords".* FROM "keywords" INNER JOIN "friendships" ON "keywords"."id" = "friendships"."friend_id" WHERE "friendships"."keyword_id" = ?'
	cur.execute(sql,[keyword_id])
	flist = cur.fetchall()
	return flist


def keyword_befriend(k1_id, friend):

	#check if friend exist in keyword already, if not insert it
	k2 = keyword_query(friend)
	if k2==None:
		keyword_insert(friend)
		k2 = keyword_query(friend)
	
	k2_id=k2[0]
	
	#error checking
	if k1_id==k2_id:
		return # friending himself
	if k2 in friend_query(k1_id):
		return # friending oldfriend

	timestamp = time.mktime(datetime.now().timetuple()) # timestamp
	sql = 'INSERT INTO "friendships" ("created_at", "friend_id", "keyword_id", "updated_at") VALUES (?, ?, ?, ?)'
	print k1_id, k2_id
	cur.execute(sql, (timestamp, k2_id, k1_id, timestamp))
	cur.execute(sql, (timestamp, k1_id, k2_id, timestamp))
	con.commit()


def category_insert(name):
	# check for category existense
	# return the entry of the category
	sql = 'SELECT "categories".* FROM "categories" WHERE "categories"."name" = ? LIMIT 1'
	cur.execute(sql, [name])
	category = cur.fetchone()
	# insert if not yet exist
	if category == None:
		timestamp = time.mktime(datetime.now().timetuple()) # timestamp
		insert = 'INSERT INTO "categories" ("created_at", "name", "updated_at") VALUES (?, ?, ?)'
		cur.execute(insert, (timestamp, name, timestamp))
		cur.execute(sql, [name])
		category = cur.fetchone()
	
	return category
		

def keyword_category(kid, category_name):
	# bind keyword and category
	c = category_insert(category_name)
	sql = 'INSERT INTO "categories_keywords" ("keyword_id", "category_id") VALUES (?, ?)'
	cur.execute(sql, (kid, c[0]))
	con.commit()



#########################################################

# regex matching (link, seealso, categories)
linkmatch=re.compile('(\[\[)([)(\s,\w,:]*?)(\]\])')
seealsomatch=re.compile('==\s?See also\s?==..*?==',re.DOTALL)
seealsomatch_1=re.compile('==\s?See also\s?==..*?\n\n',re.DOTALL)
externalmatch=re.compile('==\s?External..*]]',re.DOTALL)

for event, elem in ET.iterparse(filename,events=('end',),tag=prefix+'page'):

	# finding keyword
	title = elem.find(prefix+'title').text
	redirect = elem.find(prefix+'redirect')


	# check title in the database
	key=keyword_query(title)

	# Key not yet exist in table, then extract links and update table
	if key==None:
		# first insert key into database
		keyword_insert(title)
		key=keyword_query(title)
	
	if key!=None:

		# find text
		text = elem.find(prefix+'revision').find(prefix+'text')
		related = []
		category = []

		# if redirect exists, it will be the only related keyword
		if redirect !=None:
			related.append(redirect.get('title'))

		if text != None and redirect == None:
			
			# Only match links inside <see also> and first 10 link
			seealso = seealsomatch.search(text.text)
			if seealso==None:
				seealso = seealsomatch_1.search(text.text)

			# See also
			if seealso!=None:
				links = linkmatch.findall(seealso.group(0))
				for l in links:
					related.append(l[1].encode('ascii','ignore'))

			# grab first 10 links in the text
			links = linkmatch.findall(text.text)
			count = 0
			for l in links:
				tmp = l[1].encode('ascii','ignore') 
				# disgard repetitive words or special word
				if tmp not in related and ':' not in tmp:
					related.append(l[1].encode('ascii','ignore'))
					count+=1
				if count==10:
					break
	
			external = externalmatch.search(text.text)
			# Get category info 
			if external!=None:
				links = linkmatch.findall(external.group(0))
				for l in links:
					if re.match("Category:", l[1])!=None:
						category.append(l[1].encode('ascii','ignore')[9:])

			# import category info and bind keyword
			for c in category:
				keyword_category(key[0], c)

		for f in related:
			# Adding friendship 
			keyword_befriend(key[0],f)
			
		# tmp output
		# print title, related

	elem.clear()

print "Done updating dB"

con.commit()
con.close()

