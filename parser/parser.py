import xml.etree.cElementTree as ET

filename='snippet.xml'
prefix='{http://www.mediawiki.org/xml/export-0.8/}'

titles=[]

for event, elem in ET.iterparse(filename):
	if elem.tag == prefix+"title":
		titles.append(elem.text)
	elem.clear()

print titles
print len(titles)

print "Done parsing"
