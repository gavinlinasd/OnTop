class Webpage < ActiveRecord::Base
  attr_accessible :url
  validates :url, :presence => true

  has_and_belongs_to_many :keywords
end
