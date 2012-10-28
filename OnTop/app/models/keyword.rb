class Keyword < ActiveRecord::Base
  attr_accessible :name, :wiki_page
  validates :name, :presence => true
  validates :wiki_page, :presence => true

  has_and_belongs_to_many :webpages
end
