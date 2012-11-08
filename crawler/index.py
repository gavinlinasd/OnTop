# abstract class for index data structure
# defines all required functions for manipulation
# this allows for using different indices to preserve
# differing information
import sys

class indexbase :

    SUCCESS = 0 # resource was parsed successfully
    FAILURE = 1 # resource as unable to be parsed
    REPEAT = 2 # resource was parsed successfully, 
               # but conflicts with a previous entry
 
    # function for reading the index from a file
    def readfromfile(self, filename) :
        raise NotImplementedError("Index class needs to implement this")
    # function for writing the index to file
    def writetofile(self, filename) :
        raise NotImplementedError("Index class needs to implement this")

    # function for parsing a resource (usually a web page) to add to the index
    # returns an enum giving the status of the parse
    def parse(self, id, resource) :
        raise NotImplementedError("Index class needs to implement this")

    # adds all of the entries in the given index to this index
    # doesn't alter the other index
    def merge(self, other) :
        raise NotImplementedError("Index class needs to implement this")

    # copy function
    def copy(self) :
        raise NotImplementedError("Index class needs to implement this")

    # test for id membership
    # returns true or false
    def contains(self, id) :
        raise NotImplementedError("Index class needs to implement this")

    # prints out the entry for a single id key in readable form
    def printid(self, id) :
        raise NotImplementedError("Index class needs to implement this")

    # sequentially prints out the (id, entry) pairs for every id
    def printall(self) :
        raise NotImplementedError("Index class needs to implement this")
