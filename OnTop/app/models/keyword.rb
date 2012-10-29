class Keyword < ActiveRecord::Base
  attr_accessible :name, :wiki_page
  validates :name, :presence => true
  validates :wiki_page, :presence => true

  has_and_belongs_to_many :webpages

  has_many :parent_child_relationships,
           :class_name  => "Relationship",
           :foreign_key => :child_id
  has_many :parents,
           :through     => :parent_child_relationships,
           :source      => :parent

  has_many :child_parent_relationships,
           :class_name  => "Relationship",
           :foreign_key => :parent_id
  has_many :children,
           :through     => :child_parent_relationships,
           :source      => :child

  has_many :friendships
  has_many :friends, :through => :friendships
end
