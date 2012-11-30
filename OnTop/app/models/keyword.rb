class Keyword < ActiveRecord::Base
  attr_accessible :name, :wiki_page, :display_name
  validates :name, :presence => true
  validates :wiki_page, :presence => true

  has_and_belongs_to_many :webpages
  has_and_belongs_to_many :categories

  has_many :friendships, 
           :foreign_key => "keyword_id", 
           :class_name => "Friendship",
           :dependent => :destroy
  has_many :friends, 
           :through => :friendships

  def befriend(keyword)
    # TODO: put in check that association does not exist
    self.friends << keyword

    keyword.friends << self
  end
end
