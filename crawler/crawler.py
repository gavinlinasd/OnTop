import sys
import re
import urlparse
import urllib2
from collections import deque

keywordmatch = re.compile('<meta\sname=["\']keywords["\']\scontent=["\'](.*?)["\']\s/>')
linkmatch = re.compile('<a\s*href=[\'|"](.*?)[\'|"].*?>')

# assume that argv[1] is the starting url
# queue of urls to search for new links
# TODO: generalize to accept a list of starting sites
urlstovisit = deque([sys.argv[1]])

# assume argv[2] is the number of sites to visit
# TODO: generalized to handle a desired depth as well
maxsites = int(sys.argv[2])

criterion = 'max'

# store a set of pairs of urls and keywords
sitesvisited = dict()

# print some starting information
print 'Starting up ', sys.argv[0], '...'

if len(urlstovisit) < 1 :
    print 'Error: no urls to search!'
    quit()

print 'Beginning with url: ', urlstovisit[0]

# run until we reach end criteria, either a number of sites or a depth
while 1 :

    # if we've hit a dead end, quit
    if len(urlstovisit) < 1 :
        print 'Exhausted all urls'
        break

    # if we've hit any of the quitting criteria, stop
    if criterion == 'depth' and searchdepth > maxdepth :
        break

    if criterion == 'max' and len(sitesvisited) >= maxsites :
        break

    # pop a url from the queue
    # parse url
    url = urlstovisit.popleft();
    parsed = urlparse.urlparse(url)

    try :
        response = urllib2.urlopen(url)
    except :
        print 'Falied to open url: ', url
        continue

    print 'Parsing url: ', url

    # parse web page into new urls and keywords
    text = response.read()
    keywords = keywordmatch.findall(text)
    links = linkmatch.findall(text)
    
    # separate keywords
    if len(keywords) > 0 :
        keywords = keywords[0].split(", ")

    # remember the info for this page
    sitesvisited[url] = keywords

    # add new urls to the queue
    for link in (links.pop(0) for _ in xrange(len(links))) :
        if link.startswith('/') :
            link = 'http://' + parsed[1] + link
        elif link.startswith('#') :
            link = 'http://' + url[1] + url[2] + link
        elif not link.startswith('http') :
            link = 'http://' + url[1] + '/' + link

        # if it's new, add it
        if link not in urlstovisit :
            urlstovisit.append(link)





# save to file
