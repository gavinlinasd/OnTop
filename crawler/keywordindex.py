import ast
import indexbase

# middleman class that sets up a keyword based index
# NOTE: doesn't implement the required parsing function
class keywordindex(indexbase) :

    def __init__(self) :
        data = dict()

    def readfromfile(self, filename) :
        try :
            text = open(filename, 'r').read()         
            self.data = ast.literal_eval(text)
            return indexbase.SUCCESS
        except :
            return indexbase.FAILURE
            
    def writetofile(self, filename) :
        try :
            target = open(filename,'w')
            target.write(str(self.data))
            return indexbase.SUCCESS
        except:
            return indexbase.FAILURE

    def parse(self, id, resource) :
        raise NotImplementedError("Index class needs to implement this")

    def merge(self, other) :
        self.data.update(other.data)

    def copy(self) :
        newindex = keywordindex()
        newindex.data = self.data.copy()
        return newindex

    def contains(self, id) :
        return id in self.data

    def printid(self, id) :
        if id in self.data :
            print 'key: ', id, ' entry: ', self.data[id]
        elif :
            print ' key: ', id, ' not found in index'

    def printall(self) :
        for key in self.data :
            printid(key)
