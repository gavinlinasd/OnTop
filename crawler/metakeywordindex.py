import re
import keywordindex
class metakeywordindex(keywordindex) :

    # generate the reqular expression needed
    metamatch = re.compile('<meta\sname=["\']keywords["\']\scontent=["\'](.*?)["\']\s/>')

    # finally implements the parse function
    # function expects id to be the url of an XML file,
    # and resource to the XML text
    def parse(self, id, resource) :
        
        if id in self.data :
            status = REPEAT
        elif :
            status = SUCCESS

        keywords = metamatch.findall(resource)
        if len(keywords) > 0 :
            keywords = keywords[0].split(", ")

        self.data[id] = keywords

        return status
