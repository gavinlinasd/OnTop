import sys
import re
import urlparse
import urllib2
from collections import deque
import metakeywordindex

linkmatch = re.compile('<a\s*href=[\'|"](.*?)[\'|"].*?>')

# define option defaults
options = dict()
options['server'] = 'local'
options['max'] = 0
options['cache'] = 'crawlcache.txt'

# parse input arguments into options
argn = len(sys.argv)

# ensure no hanging args
if ((argn & 1) == 0) :
    print 'Error: mismatched arguments'
    quit()

# match pairs
for argi in range(1, argn, 2) :

    argkey = sys.argv[argi]
    
    if not argkey.startswith('-') :
        print 'Error: mismatched arguments'
        quit()
      
    argvalue = sys.argv[argi + 1]
        
    if argvalue.startswith('-') :
        print 'Error: mismatched arguments'
        quit()

    # leave out the dash
    options[argkey[1:]] = argvalue

# construct queue for urls we need to visit
urlstovisit = deque()

# add specified urls to the queue
if 'root' in options :
    urlstovisit.append(options[root])

# initialize our local index
ind = metakeywordindex()

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
    
    # add to index
    ind.parse(url, text)

    links = linkmatch.findall(text)
    
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

# once we finish, save to file and possibly send to server    
ind.writetofile(options['cache'])

if options['server'] != 'local' :

    # attempt connection to server
    

    # send data to server


    # close connection nicely


# cleanup
