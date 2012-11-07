# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
Keyword.create(:name => "Bayes' Theorem", :wiki_page => "http://en.wikipedia.org/wiki/Bayes'_theorem")
Keyword.create(:name => "Bayesian inference", :wiki_page => "http://en.wikipedia.org/wiki/Bayesian_inference")
Keyword.create(:name => "Law of total probability", :wiki_page => "http://en.wikipedia.org/wiki/Law_of_total_probability")
Keyword.create(:name => "Bayesian probability", :wiki_page => "http://en.wikipedia.org/wiki/Bayesian_probability")
Keyword.create(:name => "Quicksort", :wiki_page => "http://en.wikipedia.org/wiki/Quicksort")
Keyword.create(:name => "Divide and conquer algorithm", :wiki_page => "http://en.wikipedia.org/wiki/Divide_and_conquer_algorithm")
Keyword.create(:name => "Memoization", :wiki_page => "http://en.wikipedia.org/wiki/Memoization")
Keyword.create(:name => "Reddit", :wiki_page => "http://en.wikipedia.org/wiki/Reddit")
Keyword.create(:name => "4chan", :wiki_page => "http://en.wikipedia.org/wiki/4chan")
Keyword.create(:name => "Internet meme", :wiki_page => "http://en.wikipedia.org/wiki/Internet_meme")

web1 = Webpage.create(:url => "http://jeff560.tripod.com/b.html")
web2 = Webpage.create(:url => "http://mathworld.wolfram.com/BayesTheorem.html")
Keyword.find_by_name("Bayes' Theorem").webpages << web1
Keyword.find_by_name("Bayes' Theorem").webpages << web2

web3 = Webpage.create(:url => "http://www.encyclopediaofmath.org/index.php/Bayesian_approach")
web4 = Webpage.create(:url => "http://www.faqs.org/faqs/ai-faq/neural-nets/part3/section-7.html")
Keyword.find_by_name("Bayesian inference").webpages << web3
Keyword.find_by_name("Bayesian inference").webpages << web4

web5 = Webpage.create(:url => "http://books.google.com/books?id=_mayRBczVRwC&pg=PA47#v=onepage&q&f=false")
web6 = Webpage.create(:url => "http://books.google.com/books?id=Kglc9g5IPf4C&pg=PA179#v=onepage&q&f=false")
Keyword.find_by_name("Law of total probability").webpages << web5
Keyword.find_by_name("Law of total probability").webpages << web6

web7 = Webpage.create(:url => "http://psychclassics.yorku.ca/Peirce/small-diffs.htm")
Keyword.find_by_name("Bayesian probability").webpages << web3
Keyword.find_by_name("Bayesian probability").webpages << web7

key1 = Keyword.find_by_name("Bayes' Theorem")
key2 = Keyword.find_by_name("Bayesian inference")
key3 = Keyword.find_by_name("Law of total probability")
key4 = Keyword.find_by_name("Bayesian probability")
key5 = Keyword.find_by_name("Quicksort")
key6 = Keyword.find_by_name("Divide and conquer algorithm")
key7 = Keyword.find_by_name("Memoization")
key8 = Keyword.find_by_name("Reddit")
key9 = Keyword.find_by_name("4chan")
key10 = Keyword.find_by_name("Internet meme")

key1.befriend(key2, 0.6)
key1.befriend(key3, 0.2)
key1.befriend(key4, 0.85)
key2.befriend(key4, 0.5)

key5.befriend(key6, 0.9)
key6.befriend(key7, 0.65)

key8.befriend(key9, 0.3)
key9.befriend(key10, 0.7)
key10.befriend(key8, 0.4)

