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

key1 = Keyword.find_by_name("Bayes' Theorem")
key2 = Keyword.find_by_name("Bayesian inference")
key3 = Keyword.find_by_name("Law of total probability")

key1.befriend(key2, 0.6)
key1.befriend(key3, 0.2)
